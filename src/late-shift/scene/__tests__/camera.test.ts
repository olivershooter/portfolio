import { cameraTarget, cameraTransform } from '../camera'
import { LAYOUTS } from '../layouts'

describe('camera', () => {
	it('rests at the centre with no target or zero progress', () => {
		expect(cameraTransform(LAYOUTS.desk, null, 1)).toEqual({
			scale: 1,
			fx: 500,
			fy: 280
		})
		const target = cameraTarget(LAYOUTS.desk, 'experience')
		expect(cameraTransform(LAYOUTS.desk, target, 0)).toEqual({
			scale: 1,
			fx: 500,
			fy: 280
		})
	})

	it('pushes into the phone screen with the validated zoom', () => {
		const desk = cameraTransform(
			LAYOUTS.desk,
			cameraTarget(LAYOUTS.desk, 'android'),
			1
		)
		expect(desk).toEqual({ scale: 4.9, fx: 771, fy: 354 })
		const phone = cameraTransform(
			LAYOUTS.phone,
			cameraTarget(LAYOUTS.phone, 'android'),
			1
		)
		expect(phone.scale).toBeCloseTo(6.6)
		expect(phone.fx).toBeCloseTo(349.35)
	})

	it('fits other objects to 90% of the short edge', () => {
		const target = cameraTarget(LAYOUTS.desk, 'experience')
		expect(target.fx).toBe(456 + 136)
		expect(target.fy).toBe(246 + 84)
		expect(target.zoom).toBeCloseTo(0.9 * (560 / 168) - 1)
	})

	it('eases part-way', () => {
		const target = cameraTarget(LAYOUTS.desk, 'android')
		const half = cameraTransform(LAYOUTS.desk, target, 0.5)
		expect(half.scale).toBeCloseTo(1 + 3.9 * 0.25)
		expect(half.fx).toBeCloseTo(500 + (771 - 500) * 0.5)
	})
})
