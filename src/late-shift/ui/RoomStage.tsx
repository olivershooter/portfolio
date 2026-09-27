import type { MouseEvent, PointerEvent, RefObject } from 'react'
import { hitTest, toVirtual } from '../scene/hitTest'
import { LAYOUTS, type LayoutName } from '../scene/layouts'
import type { ObjectId } from '../scene/objects'
import RadioBadge from './RadioBadge'
import Tags from './Tags'

interface RoomStageProperties {
	readonly layoutName: LayoutName
	readonly canvasReference: RefObject<HTMLCanvasElement>
	readonly stageReference: RefObject<HTMLDivElement>
	readonly isZoomed: boolean
	readonly hasFailed: boolean
	readonly isHintVisible: boolean
	readonly isRadioOn: boolean
	readonly hasPausedRadio?: boolean
	readonly highlighted: ObjectId | null
	readonly hovered: ObjectId | null
	readonly onHover: (id: ObjectId | null) => void
	readonly onHighlight: (id: ObjectId | null) => void
	readonly onActivate: (id: ObjectId) => void
}

export default function RoomStage({
	layoutName,
	canvasReference,
	stageReference,
	isZoomed,
	hasFailed,
	isHintVisible,
	isRadioOn,
	hasPausedRadio,
	highlighted,
	hovered,
	onHover,
	onHighlight,
	onActivate
}: RoomStageProperties) {
	const layout = LAYOUTS[layoutName]
	const pointAt = (event: MouseEvent<HTMLCanvasElement>) =>
		hitTest(
			layout,
			toVirtual(
				layout,
				[event.clientX, event.clientY],
				event.currentTarget.getBoundingClientRect()
			),
			isZoomed
		)
	const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) =>
		onHover(pointAt(event))
	const onPointerLeave = () => onHover(null)
	const onCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
		const id = pointAt(event)
		if (id) onActivate(id)
	}
	return (
		<div
			ref={stageReference}
			className={`room-stage room-stage-${layoutName}${isZoomed ? ' is-zoomed' : ''}`}
		>
			<canvas
				ref={canvasReference}
				aria-hidden='true'
				className={`room-canvas${hovered ? ' is-pointer' : ''}`}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onClick={onCanvasClick}
			/>
			{hasFailed ? (
				<p className='room-fallback'>
					The room couldn’t be drawn on this device, but every section is still
					one click away below.
				</p>
			) : null}
			{isHintVisible && layoutName === 'desk' && !hasFailed ? (
				<p className='room-hint' aria-hidden='true'>
					✦ Click anything with a tag
				</p>
			) : null}
			<RadioBadge
				isOn={isRadioOn}
				isCompact={layoutName === 'phone'}
				hasPaused={hasPausedRadio}
			/>
			{hasFailed ? null : (
				<Tags
					layout={layout}
					highlighted={highlighted ?? hovered}
					isRadioOn={isRadioOn}
					isHidden={isZoomed}
					onActivate={onActivate}
					onHighlight={onHighlight}
				/>
			)}
		</div>
	)
}
