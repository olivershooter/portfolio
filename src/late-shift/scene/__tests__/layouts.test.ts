import {
	LAYOUTS,
	chooseLayout,
	placement,
	transformBox,
	transformPoint
} from '../layouts'

describe('layouts', () => {
	it('is the identity on desktop', () => {
		expect(transformPoint(LAYOUTS.desk, 'android', [771, 354])).toEqual([
			771, 354
		])
		expect(transformBox(LAYOUTS.desk, 'contact', [62, 42, 416, 306])).toEqual([
			62, 42, 416, 306
		])
		expect(placement(LAYOUTS.desk, 'lamp').s).toBe(1)
	})

	it('re-places objects for the phone layout', () => {
		const [x, y] = transformPoint(LAYOUTS.phone, 'android', [771, 354])
		expect(x).toBeCloseTo(349.35)
		expect(y).toBeCloseTo(545.1)
		const [bx, by, bw, bh] = transformBox(
			LAYOUTS.phone,
			'contact',
			[62, 42, 416, 306]
		)
		expect([bx, by]).toEqual([23, 40])
		expect(bw).toBeCloseTo(374.4)
		expect(bh).toBeCloseTo(275.4)
	})

	it('shares one placement for the shelf, camera and football', () => {
		expect(placement(LAYOUTS.phone, 'about')).toBe(
			placement(LAYOUTS.phone, 'shelf')
		)
		expect(placement(LAYOUTS.phone, 'football')).toBe(
			placement(LAYOUTS.phone, 'shelf')
		)
	})

	it('uses the phone layout only for narrow portrait viewports', () => {
		expect(chooseLayout(390, 844)).toBe('phone')
		expect(chooseLayout(699, 1000)).toBe('phone')
		expect(chooseLayout(844, 390)).toBe('desk')
		expect(chooseLayout(800, 1200)).toBe('desk')
		expect(chooseLayout(1280, 720)).toBe('desk')
	})
})
