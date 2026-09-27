import { LAYOUTS } from '../layouts'
import { hitTest, toVirtual } from '../hitTest'

describe('hit testing', () => {
	it('maps client pixels to virtual units', () => {
		const rect = { left: 100, top: 50, width: 500, height: 280 }
		expect(toVirtual(LAYOUTS.desk, [350, 190], rect)).toEqual([500, 280])
	})

	it('finds objects on desktop', () => {
		expect(hitTest(LAYOUTS.desk, [590, 330])).toBe('experience')
		expect(hitTest(LAYOUTS.desk, [200, 150])).toBe('contact')
		expect(hitTest(LAYOUTS.desk, [771, 354])).toBe('android')
		expect(hitTest(LAYOUTS.desk, [990, 20])).toBeNull()
	})

	it('prefers the top-most object where boxes overlap', () => {
		// The radio box overlaps the bottom of the window box
		expect(hitTest(LAYOUTS.desk, [200, 340])).toBe('radio')
	})

	it('uses the transformed boxes on the phone layout', () => {
		expect(hitTest(LAYOUTS.phone, [349, 545])).toBe('android')
		expect(hitTest(LAYOUTS.phone, [771, 354])).toBeNull()
	})

	it('ignores the pointer while zoomed', () => {
		expect(hitTest(LAYOUTS.desk, [590, 330], true)).toBeNull()
	})
})
