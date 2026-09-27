import { SECTION_IDS, isSectionId } from '../sectionIds'

describe('section ids', () => {
	it('accepts every section id, including nested project ids', () => {
		for (const id of SECTION_IDS) expect(isSectionId(id)).toBe(true)
		expect(isSectionId('projects/screendle')).toBe(true)
	})

	it('rejects anything else', () => {
		expect(isSectionId('projects')).toBe(false)
		expect(isSectionId('')).toBe(false)
		expect(isSectionId('ABOUT')).toBe(false)
	})
})
