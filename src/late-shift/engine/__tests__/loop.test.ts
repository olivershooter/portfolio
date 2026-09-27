import { MAX_DT, startLoop } from '../loop'

function fakeRaf() {
	const queue: FrameRequestCallback[] = []
	return {
		raf: (callback: FrameRequestCallback) => queue.push(callback),
		caf: vi.fn(),
		flush(now: number) {
			const callbacks = queue.splice(0)
			for (const callback of callbacks) callback(now)
		}
	}
}

describe('startLoop', () => {
	it('passes elapsed seconds and a clamped dt', () => {
		const clock = fakeRaf()
		const frame = vi.fn<[number, number], undefined>()
		startLoop(frame, clock)
		clock.flush(1000)
		clock.flush(1016)
		clock.flush(3000)
		expect(frame).toHaveBeenNthCalledWith(1, 0, 0)
		expect(frame.mock.calls[1][1]).toBeCloseTo(0.016)
		expect(frame.mock.calls[2][1]).toBe(MAX_DT)
		expect(frame.mock.calls[2][0]).toBeCloseTo(0.016 + MAX_DT)
	})

	it('stops calling the frame while paused and does not accumulate time', () => {
		const clock = fakeRaf()
		const frame = vi.fn<[number, number], undefined>()
		const loop = startLoop(frame, clock)
		clock.flush(0)
		loop.setPaused(true)
		expect(loop.isPaused()).toBe(true)
		clock.flush(16)
		clock.flush(32)
		expect(frame).toHaveBeenCalledTimes(1)
		loop.setPaused(false)
		clock.flush(48)
		expect(frame).toHaveBeenCalledTimes(2)
		expect(frame.mock.calls[1][0]).toBeCloseTo(0.016)
	})

	it('cancels on stop', () => {
		const clock = fakeRaf()
		const frame = vi.fn<[number, number], undefined>()
		const loop = startLoop(frame, clock)
		loop.stop()
		clock.flush(0)
		expect(frame).not.toHaveBeenCalled()
		expect(clock.caf).toHaveBeenCalled()
	})

	it('ignores clocks that run backwards', () => {
		const clock = fakeRaf()
		const frame = vi.fn<[number, number], undefined>()
		startLoop(frame, clock)
		clock.flush(100)
		clock.flush(50)
		expect(frame.mock.calls[1][1]).toBe(0)
	})

	it('uses requestAnimationFrame by default', () => {
		const raf = vi.spyOn(window, 'requestAnimationFrame')
		const caf = vi.spyOn(window, 'cancelAnimationFrame')
		startLoop(vi.fn()).stop()
		expect(raf).toHaveBeenCalled()
		expect(caf).toHaveBeenCalled()
	})
})
