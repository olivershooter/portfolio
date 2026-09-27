import type { Mock } from 'vitest'
import { cameraTarget, cameraTransform } from '../camera'
import { LAYOUTS, type LayoutName } from '../layouts'
import { INKS } from '../math'
import { drawRoom } from '../room'
import type { RoomRenderState } from '../state'
import { TOD, type TodName } from '../timeOfDay'

function fakeContext() {
	const spies = new Map<string, Mock>()
	const values: Record<string, unknown> = {}
	const gradient = { addColorStop: vi.fn() }
	const context = new Proxy(values, {
		get(target, key: string) {
			if (key in target) return target[key]
			if (key === 'createLinearGradient' || key === 'createRadialGradient')
				return () => gradient
			if (key === 'measureText') return () => ({ width: 40 })
			if (!spies.has(key)) spies.set(key, vi.fn())
			return spies.get(key)
		},
		set(target, key: string, value) {
			target[key] = value
			return true
		}
	}) as unknown as CanvasRenderingContext2D
	const calls = (name: string) => spies.get(name)?.mock.calls.length ?? 0
	return { context, calls }
}

function state(
	layout: LayoutName,
	tod: TodName,
	overrides: Partial<RoomRenderState> = {}
): RoomRenderState {
	return {
		layout: LAYOUTS[layout],
		tod: TOD[tod],
		hover: {},
		camera: cameraTransform(LAYOUTS[layout], null, 0),
		phoneReveal: 0,
		radioOn: false,
		reelAngle: 0,
		isLightRain: layout === 'phone',
		...overrides
	}
}

describe('drawRoom', () => {
	it.each(['desk', 'phone'] as const)(
		'draws every time of day on the %s layout',
		layout => {
			for (const tod of ['dawn', 'day', 'dusk', 'night'] as const) {
				for (const ink of INKS) {
					const { context, calls } = fakeContext()
					drawRoom(ink, context, 12.3, state(layout, tod))
					expect(calls('fill')).toBeGreaterThan(100)
					expect(calls('save')).toBe(calls('restore'))
				}
			}
		}
	)

	it('draws hover, radio and the phone reveal states', () => {
		const layout = LAYOUTS.desk
		for (const ink of INKS) {
			const { context, calls } = fakeContext()
			drawRoom(
				ink,
				context,
				3,
				state('desk', 'night', {
					hover: { experience: 1, android: 0.5 },
					radioOn: true,
					reelAngle: 2,
					phoneReveal: 1,
					camera: cameraTransform(layout, cameraTarget(layout, 'android'), 1)
				})
			)
			expect(calls('save')).toBe(calls('restore'))
			expect(calls('fillText')).toBeGreaterThan(5)
		}
	})

	it('draws half as many rain streaks on light rain', () => {
		const heavy = fakeContext()
		drawRoom(
			'b',
			heavy.context,
			1,
			state('desk', 'night', { isLightRain: false })
		)
		const light = fakeContext()
		drawRoom(
			'b',
			light.context,
			1,
			state('desk', 'night', { isLightRain: true })
		)
		expect(light.calls('stroke')).toBeLessThan(heavy.calls('stroke'))
	})
})
