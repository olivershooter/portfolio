import { createRoomEngine } from '../roomEngine'

const { compositor, loop, frames } = vi.hoisted(() => ({
	compositor: { resize: vi.fn(), render: vi.fn() },
	loop: { stop: vi.fn(), setPaused: vi.fn(), isPaused: vi.fn(() => false) },
	frames: [] as ((seconds: number, dt: number) => void)[]
}))
vi.mock('../compositor', () => ({ createCompositor: () => compositor }))
vi.mock('../loop', () => ({
	startLoop: (frame: (seconds: number, dt: number) => void) => {
		frames.push(frame)
		return loop
	}
}))

function tick(dt = 0.016) {
	frames.at(-1)?.(1, dt)
}

describe('createRoomEngine', () => {
	beforeEach(() => {
		Object.defineProperty(document, 'fonts', {
			configurable: true,
			value: { load: vi.fn(async () => []) }
		})
		vi.useFakeTimers({ toFake: ['Date'] })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const options = {
		layout: 'desk',
		width: 100,
		height: 56,
		isReducedMotion: true,
		dpr: 1
	} as const

	it('redraws the still (reduced-motion) room when the time of day changes', () => {
		vi.setSystemTime(new Date(2026, 8, 27, 16, 59, 50))
		createRoomEngine(document.createElement('canvas'), options)
		tick()
		tick()
		expect(compositor.render).toHaveBeenCalledTimes(1)
		vi.setSystemTime(new Date(2026, 8, 27, 17, 0, 10))
		tick()
		expect(compositor.render).toHaveBeenCalledTimes(2)
	})

	it('stops and reports when drawing throws', () => {
		const onError = vi.fn()
		compositor.render.mockImplementationOnce(() => {
			throw new Error('roundRect is not a function')
		})
		createRoomEngine(document.createElement('canvas'), {
			...options,
			onError
		})
		tick()
		expect(loop.stop).toHaveBeenCalled()
		expect(onError).toHaveBeenCalledWith(expect.any(Error))
	})
})
