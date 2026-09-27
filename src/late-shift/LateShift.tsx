import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SwitchVersionLink from '../components/SwitchVersionLink'
import { track } from '../lib/analytics'
import useReducedMotion from '../lib/useReducedMotion'
import { getRoomObject, type ObjectId } from './scene/objects'
import { hoverFromSearch, todFromSearch } from './ui/debugParameters'
import RoomStage from './ui/RoomStage'
import SectionChips from './ui/SectionChips'
import useRoomEngine from './ui/useRoomEngine'
import './lateShift.css'

export default function LateShift() {
	const isReducedMotion = useReducedMotion()
	const navigate = useNavigate()
	const [searchParameters] = useSearchParams()
	const canvasReference = useRef<HTMLCanvasElement>(null)
	const stageReference = useRef<HTMLDivElement>(null)
	const { engine, layoutName, hasFailed } = useRoomEngine({
		canvasReference,
		stageReference,
		isReducedMotion
	})
	const [hovered, setHovered] = useState<ObjectId | null>(null)
	const [highlighted, setHighlighted] = useState<ObjectId | null>(null)
	const [isRadioOn, setIsRadioOn] = useState(false)
	const [isHintVisible, setIsHintVisible] = useState(true)

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

	const onActivate = useCallback(
		(id: ObjectId) => {
			setIsHintVisible(false)
			const { section } = getRoomObject(id)
			if (section === null) {
				const next = !isRadioOn
				setIsRadioOn(next)
				track('radio-toggled', { on: next })
				return
			}
			navigate(`/late-shift/${section}`)
		},
		[isRadioOn, navigate]
	)
	const onHover = setHovered
	const onHighlight = setHighlighted

	return (
		<main className='late-shift' data-scroll='static'>
			<h1 className='sr-only'>The Late Shift: Oliver Shooter&apos;s room</h1>
			<p className='sr-only'>
				An illustrated desk at night in Manchester. Rain runs down the window, a
				tram goes past, and a lamp lights the desk. Each labelled object opens a
				part of the portfolio.
			</p>
			<div className='room-sticky'>
				<RoomStage
					layoutName={layoutName}
					canvasReference={canvasReference}
					stageReference={stageReference}
					isZoomed={false}
					hasFailed={hasFailed}
					isHintVisible={isHintVisible}
					isRadioOn={isRadioOn}
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
			<p className='late-shift-footer'>
				<Link to='/quick'>Read everything on one page</Link>
				<span aria-hidden='true'> · </span>
				<SwitchVersionLink />
			</p>
		</main>
	)
}
