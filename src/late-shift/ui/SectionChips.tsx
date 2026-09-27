import {
	CHIP_ORDER,
	getRoomObject,
	type ObjectId,
	type RoomObject
} from '../scene/objects'

interface SectionChipsProperties {
	readonly highlighted: ObjectId | null
	readonly isRadioOn: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

interface ChipProperties extends Omit<SectionChipsProperties, 'highlighted'> {
	readonly object: RoomObject
	readonly isActive: boolean
}

function Chip({
	object,
	isActive,
	isRadioOn,
	onActivate,
	onHighlight
}: ChipProperties) {
	const onClick = () => onActivate(object.id)
	const onEnter = () => onHighlight(object.id)
	const onLeave = () => onHighlight(null)
	const label =
		object.section === null
			? `${object.number} ${object.label}`
			: `${object.number} · ${object.label}`
	return (
		<button
			type='button'
			className={`room-chip${isActive ? ' is-active' : ''}`}
			aria-pressed={object.section === null ? isRadioOn : undefined}
			onClick={onClick}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onFocus={onEnter}
			onBlur={onLeave}
		>
			{label}
		</button>
	)
}

export default function SectionChips({
	highlighted,
	isRadioOn,
	onActivate,
	onHighlight
}: SectionChipsProperties) {
	return (
		<nav aria-label='Sections' className='room-chips'>
			<ul>
				{CHIP_ORDER.map(id => (
					<li key={id}>
						<Chip
							object={getRoomObject(id)}
							isActive={highlighted === id}
							isRadioOn={isRadioOn}
							onActivate={onActivate}
							onHighlight={onHighlight}
						/>
					</li>
				))}
			</ul>
		</nav>
	)
}
