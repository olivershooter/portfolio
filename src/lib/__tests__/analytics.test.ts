import { track } from '../analytics'

describe('track', () => {
	afterEach(() => {
		delete window.umami
	})

	it('forwards events to umami when present', () => {
		const spy = vi.fn()
		window.umami = { track: spy }
		track('version-chosen', { version: 'quick' })
		expect(spy).toHaveBeenCalledWith('version-chosen', { version: 'quick' })
	})

	it('does nothing when umami is blocked', () => {
		expect(() => track('radio-toggled', { on: true })).not.toThrow()
	})

	it('swallows errors thrown by umami', () => {
		window.umami = {
			track: () => {
				throw new Error('network')
			}
		}
		expect(() =>
			track('section-opened', { section: 'about', version: 'late-shift' })
		).not.toThrow()
	})
})
