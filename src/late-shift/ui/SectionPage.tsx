import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SwitchVersionLink from '../../components/SwitchVersionLink'
import type { SectionId } from '../sectionIds'
import PrintHeading from '../sections/PrintHeading'
import { SECTIONS } from '../sections/registry'
import useFocusTrap from './useFocusTrap'

interface SectionPageProperties {
	readonly section: SectionId
	readonly onClose: () => void
}

export default function SectionPage({
	section,
	onClose
}: SectionPageProperties) {
	const entry = SECTIONS[section]
	const dialogReference = useRef<HTMLDivElement>(null)
	const headingReference = useRef<HTMLHeadingElement>(null)
	useFocusTrap(dialogReference, onClose)

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
