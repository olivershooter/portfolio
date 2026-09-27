import { useEffect, useRef, type CSSProperties } from 'react'
import { transformBox, transformPoint, type Layout } from '../scene/layouts'
import { ROOM_OBJECTS, type ObjectId, type RoomObject } from '../scene/objects'

interface TagsProperties {
	readonly layout: Layout
	readonly highlighted: ObjectId | null
	readonly isRadioOn: boolean
	readonly isHidden: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

function tagAnchor(layout: Layout, object: RoomObject): [number, number] {
	const [x, y, w, h] = transformBox(layout, object.id, object.box)
	if (object.tagSide === 'above') return [x + w / 2, y]
	if (object.tagY === undefined) return [x + w / 2, y + h]
	return [x + w / 2, transformPoint(layout, object.id, [0, object.tagY])[1]]
}

interface RoomTagProperties {
	readonly layout: Layout
	readonly object: RoomObject
	readonly index: number
	readonly isActive: boolean
	readonly isRadioOn: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

function RoomTag({
	layout,
	object,
	index,
	isActive,
	isRadioOn,
	onActivate,
	onHighlight
}: RoomTagProperties) {
	const [ax, ay] = tagAnchor(layout, object)
	const style = {
		left: `${(ax / layout.vw) * 100}%`,
		top: `${(ay / layout.vh) * 100}%`,
		'--tilt': `${((index % 3) - 1) * 1.8}deg`,
		'--delay': `${0.2 + index * 0.07}s`
	} as CSSProperties
	const onClick = () => onActivate(object.id)
	const onEnter = () => onHighlight(object.id)
	const onLeave = () => onHighlight(null)
	return (
		<button
			type='button'
			data-object={object.id}
			className={`room-tag room-tag-${object.tagSide}${isActive ? ' is-active' : ''}`}
			style={style}
			aria-pressed={object.id === 'radio' ? isRadioOn : undefined}
			aria-describedby={`room-object-${object.id}`}
			onClick={onClick}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onFocus={onEnter}
			onBlur={onLeave}
		>
			<span className='room-tag-dot' aria-hidden='true' />
			{object.label}
		</button>
	)
}

export default function Tags({
	layout,
	highlighted,
	isRadioOn,
	isHidden,
	onActivate,
	onHighlight
}: TagsProperties) {
	const listReference = useRef<HTMLUListElement>(null)
	// React 18 has no `inert` prop; set it directly so hidden tags leave the tab order
	useEffect(() => {
		listReference.current?.toggleAttribute('inert', isHidden)
	}, [isHidden])
	return (
		<>
			<ul
				ref={listReference}
				className={`room-tags${isHidden ? ' is-hidden' : ''}`}
				aria-label='Things in the room'
			>
				{ROOM_OBJECTS.map((object, index) => (
					<li key={object.id}>
						<RoomTag
							layout={layout}
							object={object}
							index={index}
							isActive={highlighted === object.id}
							isRadioOn={isRadioOn}
							onActivate={onActivate}
							onHighlight={onHighlight}
						/>
					</li>
				))}
			</ul>
			{ROOM_OBJECTS.map(object => (
				<span key={object.id} id={`room-object-${object.id}`} hidden>
					{object.description}
				</span>
			))}
		</>
	)
}
