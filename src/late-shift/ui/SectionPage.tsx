import { useEffect, useRef, type TouchEvent, type WheelEvent } from 'react'
import { Link } from 'react-router-dom'
import SwitchVersionLink from '../../components/SwitchVersionLink'
import type { SectionId } from '../sectionIds'
import PrintHeading from '../sections/PrintHeading'
import { SECTIONS } from '../sections/registry'
import useFocusTrap from './useFocusTrap'

interface SectionPageProperties {
	readonly section: SectionId
	readonly onClose: () => void
	/** The reverse of the scroll-scrub: scrolling up at the top leaves the section. */
	readonly isScrubExit?: boolean
}

/** Pixels of downward swipe at the top that count as "scroll back up". */
const SWIPE_EXIT = 48

export default function SectionPage({
	section,
	onClose,
	isScrubExit = false
}: SectionPageProperties) {
	const entry = SECTIONS[section]
	const dialogReference = useRef<HTMLDivElement>(null)
	const headingReference = useRef<HTMLHeadingElement>(null)
	const touchStart = useRef<number | null>(null)
	useFocusTrap(dialogReference, onClose)

	const isAtTop = () => (dialogReference.current?.scrollTop ?? 0) <= 0
	const onWheel = (event: WheelEvent<HTMLDivElement>) => {
		if (isScrubExit && event.deltaY < 0 && isAtTop()) onClose()
	}
	const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
		touchStart.current =
			event.touches.length > 0 ? event.touches[0].clientY : null
	}
	const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
		const start = touchStart.current
		if (!isScrubExit || start === null || event.touches.length === 0) return
		if (event.touches[0].clientY - start > SWIPE_EXIT && isAtTop()) {
			touchStart.current = null
			onClose()
		}
	}

	useEffect(() => {
		headingReference.current?.focus()
	}, [section])

	useEffect(() => {
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [])

	return (
		<div
			ref={dialogReference}
			role='dialog'
			aria-modal='true'
			aria-labelledby='section-title'
			className={`section-page skin-${entry.skin}`}
			onWheel={onWheel}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
		>
			<div className='section-page-inner'>
				<button type='button' className='section-back' onClick={onClose}>
					<span aria-hidden='true'>← </span>Back to the room
					<span aria-hidden='true'> (Esc)</span>
				</button>
				<p className='section-kicker'>{entry.kicker}</p>
				<PrintHeading id='section-title' ref={headingReference} tabIndex={-1}>
					{entry.title}
				</PrintHeading>
				<div className='section-body'>{entry.render()}</div>
				<p className='section-footer'>
					<Link to='/quick'>Read everything on one page</Link>
					<span aria-hidden='true'> · </span>
					<SwitchVersionLink />
				</p>
			</div>
		</div>
	)
}
