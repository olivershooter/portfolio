import { clamp01, coverage, ease, hash, mix, pick, scaleTri } from '../math'

describe('scene math', () => {
	it('hashes deterministically into [0, 1)', () => {
		expect(hash(3, 4, 5)).toBe(hash(3, 4, 5))
		expect(hash(3, 4, 5)).not.toBe(hash(3, 4, 6))
		for (let index = 0; index < 200; index += 1) {
			const value = hash(index, index * 7, 11)
			expect(value).toBeGreaterThanOrEqual(0)
			expect(value).toBeLessThan(1)
		}
	})

	it('clamps and formats coverage', () => {
		expect(clamp01(-2)).toBe(0)
		expect(clamp01(3)).toBe(1)
		expect(coverage(0.5)).toBe('rgba(0,0,0,0.5)')
		expect(coverage(4)).toBe('rgba(0,0,0,1)')
	})

	it('eases with a clamped smoothstep', () => {
		expect(ease(0)).toBe(0)
		expect(ease(1)).toBe(1)
		expect(ease(0.5)).toBe(0.5)
		expect(ease(-1)).toBe(0)
		expect(ease(2)).toBe(1)
	})

	it('mixes, scales and picks ink coverages', () => {
		expect(mix([0, 0, 0], [1, 2, 3], 0.5)).toEqual([0.5, 1, 1.5])
		const scaled = scaleTri([0.2, 0.4, 0.6], 0.5)
		const lifted = scaleTri([0.2, 0.4, 0.6], 0.5, 0.1)
		for (const [index, expected] of [0.1, 0.2, 0.3].entries())
			expect(scaled[index]).toBeCloseTo(expected)
		for (const [index, expected] of [0.2, 0.3, 0.4].entries())
			expect(lifted[index]).toBeCloseTo(expected)
		expect(pick('y', [0.1, 0.2, 0.3])).toBe(0.1)
		expect(pick('p', [0.1, 0.2, 0.3])).toBe(0.2)
		expect(pick('b', [0.1, 0.2, 0.3])).toBe(0.3)
	})
})
