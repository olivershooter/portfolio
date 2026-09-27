import { useCallback, useEffect, useRef, useState } from 'react'
import {
	Link,
	Navigate,
	useNavigate,
	useParams,
	useSearchParams
} from 'react-router-dom'
import SwitchVersionLink from '../components/SwitchVersionLink'
import { track } from '../lib/analytics'
import useReducedMotion from '../lib/useReducedMotion'
import { getRoomObject, objectForSection, type ObjectId } from './scene/objects'
import { isSectionId, type SectionId } from './sectionIds'
import { hoverFromSearch, todFromSearch } from './ui/debugParameters'
import RoomStage from './ui/RoomStage'
import SectionChips from './ui/SectionChips'
import SectionPage from './ui/SectionPage'
import useCameraTween from './ui/useCameraTween'
import useLofiRadio from './ui/useLofiRadio'
import useRoomEngine from './ui/useRoomEngine'
import useScrollIntoPhone from './ui/useScrollIntoPhone'
import './lateShift.css'

export default function LateShift() {
	const isReducedMotion = useReducedMotion()
	const navigate = useNavigate()
	const [searchParameters] = useSearchParams()
	const path = useParams()['*'] ?? ''
	const section: SectionId | null = isSectionId(path) ? path : null
	const canvasReference = useRef<HTMLCanvasElement>(null)
	const stageReference = useRef<HTMLDivElement>(null)
	const { engine, layoutName, hasFailed, setCovered } = useRoomEngine({
		canvasReference,
		stageReference,
		isReducedMotion
	})
	const { flyTo, jumpTo } = useCameraTween(engine, isReducedMotion)
	const [hovered, setHovered] = useState<ObjectId | null>(null)
	const [highlighted, setHighlighted] = useState<ObjectId | null>(null)
	const {
		isOn: isRadioOn,
		wasOn: wasRadioOn,
		onToggle: onRadioToggle
	} = useLofiRadio()
	const [isHintVisible, setIsHintVisible] = useState(true)
	const [pageSection, setPageSection] = useState<SectionId | null>(null)
	const [isZoomed, setIsZoomed] = useState(false)
	const cameraObject = useRef<ObjectId | null>(null)
	const pendingFocus = useRef<ObjectId | null>(null)
	const isInitial = useRef(true)
	const spacerReference = useRef<HTMLDivElement>(null)
	const [isScrubEnabled, setIsScrubEnabled] = useState(true)
	const onScrubProgress = useCallback(
		(progress: number) => {
			const target = progress > 0 ? 'android' : null
			void jumpTo(target, progress)
			cameraObject.current = target
			setIsZoomed(progress > 0.03)
		},
		[jumpTo]
	)
	const onScrubArrive = useCallback(
		() => navigate('/late-shift/android'),
		[navigate]
	)
	useScrollIntoPhone({
		spacerReference,
		isEnabled: !isReducedMotion && isScrubEnabled && section === null,
		onProgress: onScrubProgress,
		onArrive: onScrubArrive
	})

	useEffect(() => {
		engine?.setHover(hovered)
	}, [engine, hovered])
	useEffect(() => {
		engine?.setHighlight(highlighted ?? hoverFromSearch(searchParameters))
	}, [engine, highlighted, searchParameters])
	useEffect(() => {
		engine?.setRadio(isRadioOn)
	}, [engine, isRadioOn])
	useEffect(() => {
		engine?.setTodMode(todFromSearch(searchParameters))
	}, [engine, searchParameters])

	useEffect(() => {
		let isCancelled = false
		const isFirst = isInitial.current
		isInitial.current = false
		const previous = cameraObject.current
		if (section === null) {
			setPageSection(null)
			setCovered(false)
			if (previous !== null) {
				setIsScrubEnabled(false)
				window.scrollTo({ top: 0 })
				void flyTo(previous, 0).then(() => {
					if (isCancelled) return
					cameraObject.current = null
					pendingFocus.current = previous
					setIsZoomed(false)
					setIsScrubEnabled(true)
				})
			}
			return () => {
				isCancelled = true
			}
		}
		const target = objectForSection(section)
		setIsScrubEnabled(false)
		track('section-opened', { section, version: 'late-shift' })
		cameraObject.current = target
		setIsZoomed(true)
		setPageSection(null)
		const arrive = isFirst || hasFailed ? jumpTo(target, 1) : flyTo(target, 1)
		void arrive.then(() => {
			if (isCancelled) return
			setPageSection(section)
			setCovered(true)
		})
		return () => {
			isCancelled = true
		}
	}, [section, flyTo, jumpTo, setCovered, hasFailed])

	useEffect(() => {
		if (isZoomed || pendingFocus.current === null) return
		document
			.querySelector<HTMLElement>(`[data-object="${pendingFocus.current}"]`)
			?.focus()
		pendingFocus.current = null
	}, [isZoomed])

	const onActivate = useCallback(
		(id: ObjectId) => {
			setIsHintVisible(false)
			const object = getRoomObject(id)
			if (object.section === null) {
				onRadioToggle()
				return
			}
			navigate(`/late-shift/${object.section}`)
		},
		[navigate, onRadioToggle]
	)
	const onClose = useCallback(() => navigate('/late-shift'), [navigate])
	const onHover = setHovered
	const isStageZoomed = isZoomed && pageSection !== null
	const onHighlight = setHighlighted

	if (path !== '' && section === null)
		return <Navigate to='/late-shift' replace />

	return (
		<main
			className='late-shift'
			data-scroll={isReducedMotion ? 'static' : 'scrub'}
		>
			<h1 className='sr-only'>The Late Shift: Oliver Shooter&apos;s room</h1>
			<p className='sr-only'>
				An illustrated desk at night in Manchester. Rain runs down the window, a
				tram goes past, and a lamp lights the desk. Each labelled object opens a
				part of the portfolio.
			</p>
			<div ref={spacerReference} className='room-scroll'>
				<div className='room-sticky'>
					<RoomStage
						layoutName={layoutName}
						canvasReference={canvasReference}
						stageReference={stageReference}
						isZoomed={isStageZoomed}
						hasFailed={hasFailed}
						isHintVisible={isHintVisible}
						isRadioOn={isRadioOn}
						hasPausedRadio={wasRadioOn}
						highlighted={highlighted}
						hovered={hovered}
						onHover={onHover}
						onHighlight={onHighlight}
						onActivate={onActivate}
					/>
					<SectionChips
						highlighted={highlighted}
						isRadioOn={isRadioOn}
						onActivate={onActivate}
						onHighlight={onHighlight}
					/>
				</div>
			</div>
			<p className='late-shift-footer'>
				<Link to='/quick'>Read everything on one page</Link>
				<span aria-hidden='true'> · </span>
				<SwitchVersionLink />
			</p>
			{pageSection ? (
				<SectionPage section={pageSection} onClose={onClose} />
			) : null}
		</main>
	)
}
