import { hoverFromSearch, todFromSearch } from '../debugParameters'

describe('debug parameters', () => {
	it('reads a valid time of day or falls back to auto', () => {
		expect(todFromSearch(new URLSearchParams('tod=night'))).toBe('night')
		expect(todFromSearch(new URLSearchParams('tod=teatime'))).toBe('auto')
		expect(todFromSearch(new URLSearchParams(''))).toBe('auto')
	})

	it('reads a valid object id to highlight', () => {
		expect(hoverFromSearch(new URLSearchParams('hover=experience'))).toBe(
			'experience'
		)
		expect(hoverFromSearch(new URLSearchParams('hover=lamp'))).toBeNull()
		expect(hoverFromSearch(new URLSearchParams(''))).toBeNull()
	})
})
