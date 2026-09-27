import { scrubAction } from '../useScrollIntoPhone'

describe('scrubAction', () => {
	it('drives the camera until the phone is reached', () => {
		expect(scrubAction(0)).toEqual({ kind: 'camera', progress: 0 })
		expect(scrubAction(0.5)).toEqual({ kind: 'camera', progress: 0.5 })
		expect(scrubAction(0.998)).toEqual({ kind: 'camera', progress: 0.998 })
	})

	it('opens the Android section at the end of the scroll', () => {
		expect(scrubAction(0.999)).toEqual({ kind: 'open' })
		expect(scrubAction(1)).toEqual({ kind: 'open' })
	})
})
