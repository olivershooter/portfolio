import { SECTION_IDS } from '../../sectionIds'
import {
	CHIP_ORDER,
	ROOM_OBJECTS,
	getRoomObject,
	objectForSection
} from '../objects'

describe('room objects', () => {
	it('has 9 uniquely identified objects, all in the chip order', () => {
		const ids = ROOM_OBJECTS.map(object => object.id)
		expect(new Set(ids).size).toBe(9)
		expect([...CHIP_ORDER].sort()).toEqual([...ids].sort())
	})

	it('maps every section to exactly one object, and the radio to none', () => {
		for (const section of SECTION_IDS)
			expect(
				ROOM_OBJECTS.filter(object => object.section === section)
			).toHaveLength(1)
		expect(getRoomObject('radio').section).toBeNull()
		expect(objectForSection('projects/screendle')).toBe('screendle')
		expect(objectForSection('android')).toBe('android')
	})

	it('throws for unknown ids', () => {
		expect(() => getRoomObject('lamp' as 'radio')).toThrow(
			/Unknown room object/
		)
	})
})
