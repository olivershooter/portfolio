import { TOD, approachTod, autoTod, resolveTod } from '../timeOfDay'

const at = (hour: number, minute = 0) => new Date(2026, 8, 27, hour, minute)

describe('time of day', () => {
	it.each([
		[0, 0, 'night'],
		[4, 59, 'night'],
		[5, 0, 'dawn'],
		[7, 59, 'dawn'],
		[8, 0, 'day'],
		[16, 59, 'day'],
		[17, 0, 'dusk'],
		[19, 59, 'dusk'],
		[20, 0, 'night'],
		[23, 59, 'night']
	] as const)('%i:%i is %s', (hour, minute, expected) => {
		expect(autoTod(at(hour, minute))).toBe(expected)
	})

	it('resolves auto from the clock and passes fixed modes through', () => {
		expect(resolveTod('auto', at(12))).toBe('day')
		expect(resolveTod('night', at(12))).toBe('night')
	})

	it('approaches a target state', () => {
		expect(approachTod(TOD.day, TOD.night, 0)).toEqual(TOD.day)
		expect(approachTod(TOD.day, TOD.night, 1)).toEqual(TOD.night)
		expect(approachTod(TOD.day, TOD.night, 5)).toEqual(TOD.night)
		expect(approachTod(TOD.day, TOD.night, 0.5).lamp).toBeCloseTo(
			(TOD.day.lamp + TOD.night.lamp) / 2
		)
	})
})
