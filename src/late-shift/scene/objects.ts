import type { SectionId } from '../sectionIds'

export type ObjectId =
	| 'about'
	| 'android'
	| 'candice'
	| 'contact'
	| 'experience'
	| 'football'
	| 'radio'
	| 'screendle'
	| 'skills'

export type Box = readonly [number, number, number, number]

export interface RoomObject {
	readonly id: ObjectId
	readonly label: string
	readonly number: string
	readonly section: SectionId | null
	readonly box: Box
	readonly tagSide: 'above' | 'below'
	readonly tagY?: number
	readonly description: string
}

/** Draw order: later entries are drawn on top and win hit tests. Boxes are in desktop virtual units. */
export const ROOM_OBJECTS: readonly RoomObject[] = [
	{
		id: 'contact',
		label: 'Contact',
		number: '05',
		section: 'contact',
		box: [62, 42, 416, 306],
		tagSide: 'above',
		description: 'The window: Manchester in the rain, with a tram going past.'
	},
	{
		id: 'screendle',
		label: 'Screendle',
		number: 'P2',
		section: 'projects/screendle',
		box: [508, 62, 96, 140],
		tagSide: 'above',
		description: 'A Screendle film poster on the wall.'
	},
	{
		id: 'candice',
		label: 'Candice',
		number: 'P3',
		section: 'projects/candice',
		box: [622, 80, 126, 112],
		tagSide: 'above',
		description: 'Sticky notes saying hello in four languages.'
	},
	{
		id: 'about',
		label: 'About me',
		number: '01',
		section: 'about',
		box: [782, 148, 86, 60],
		tagSide: 'above',
		description: 'A Super 8 film camera on the shelf.'
	},
	{
		id: 'football',
		label: 'Football Stats',
		number: 'P1',
		section: 'projects/football',
		box: [878, 168, 40, 42],
		tagSide: 'below',
		tagY: 216,
		description: 'A football on the shelf.'
	},
	{
		id: 'radio',
		label: 'Lofi radio',
		number: '♪',
		section: null,
		box: [146, 326, 160, 86],
		tagSide: 'below',
		description: 'A cassette radio. Turns lofi music and rain sounds on or off.'
	},
	{
		id: 'skills',
		label: 'Skills',
		number: '04',
		section: 'skills',
		box: [388, 364, 64, 48],
		tagSide: 'below',
		description: 'A stack of books.'
	},
	{
		id: 'experience',
		label: 'Experience',
		number: '03',
		section: 'experience',
		box: [456, 246, 272, 168],
		tagSide: 'below',
		description: 'A laptop with code on the screen.'
	},
	{
		id: 'android',
		label: 'Android',
		number: '02',
		section: 'android',
		box: [738, 296, 66, 116],
		tagSide: 'below',
		description: 'A phone on a stand showing prayer times.'
	}
]

export const CHIP_ORDER: readonly ObjectId[] = [
	'about',
	'android',
	'experience',
	'skills',
	'contact',
	'football',
	'screendle',
	'candice',
	'radio'
]

export function getRoomObject(id: ObjectId): RoomObject {
	const object = ROOM_OBJECTS.find(item => item.id === id)
	if (!object) throw new Error(`Unknown room object: ${id}`)
	return object
}

export function objectForSection(section: SectionId): ObjectId {
	const object = ROOM_OBJECTS.find(item => item.section === section)
	// Every SectionId has an object (pinned by tests), so this throw is unreachable
	/* istanbul ignore next -- @preserve */
	if (!object) throw new Error(`No room object for section: ${section}`)
	return object.id
}
