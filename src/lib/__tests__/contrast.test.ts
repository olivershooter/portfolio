import { contrastRatio, relativeLuminance } from '../contrast'

describe('contrast', () => {
	it('computes WCAG relative luminance', () => {
		expect(relativeLuminance('#000000')).toBe(0)
		expect(relativeLuminance('#ffffff')).toBe(1)
		expect(relativeLuminance('#FFFFFF')).toBe(1)
	})

	it('computes contrast ratios in either order', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
		expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
		expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
		expect(contrastRatio('#3255a4', '#3255a4')).toBe(1)
	})

	it('rejects anything that is not a 6-digit hex colour', () => {
		expect(() => relativeLuminance('#fff')).toThrow(/Invalid hex/)
		expect(() => relativeLuminance('blue')).toThrow(/Invalid hex/)
	})
})
