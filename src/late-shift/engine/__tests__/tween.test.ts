import { easeInOut, tweenValue } from '../tween'

function fakeRaf() {
	const queue: FrameRequestCallback[] = []
	return {
		raf: (callback: FrameRequestCallback) => queue.push(callback),
		caf: vi.fn(),
		flush(now: number) {
			for (const callback of queue.splice(0)) callback(now)
		}
	}
}

describe('tweenValue', () => {
	it('eases from one value to another over the duration', () => {
		const clock = fakeRaf()
		const onUpdate = vi.fn()
		const onComplete = vi.fn()
		tweenValue({ from: 0, to: 1, duration: 1, onUpdate, onComplete }, clock)
		clock.flush(1000)
		clock.flush(1500)
		expect(onUpdate).toHaveBeenLastCalledWith(0.5)
		expect(onComplete).not.toHaveBeenCalled()
		clock.flush(2000)
		expect(onUpdate).toHaveBeenLastCalledWith(1)
		expect(onComplete).toHaveBeenCalledTimes(1)
	})

	it('finishes at once for a zero duration', () => {
		const onUpdate = vi.fn()
		const onComplete = vi.fn()
		tweenValue({ from: 0.2, to: 0, duration: 0, onUpdate, onComplete })
		expect(onUpdate).toHaveBeenCalledWith(0)
		expect(onComplete).toHaveBeenCalledTimes(1)
	})

	it('stops updating once killed', () => {
		const clock = fakeRaf()
		const onUpdate = vi.fn()
		const onComplete = vi.fn()
		const tween = tweenValue(
			{ from: 0, to: 1, duration: 1, onUpdate, onComplete },
			clock
		)
		clock.flush(0)
		tween.kill()
		clock.flush(2000)
		expect(onComplete).not.toHaveBeenCalled()
		expect(clock.caf).toHaveBeenCalled()
	})

	it('uses requestAnimationFrame by default', () => {
		const raf = vi.spyOn(window, 'requestAnimationFrame')
		tweenValue({
			from: 0,
			to: 1,
			duration: 1,
			onUpdate: vi.fn(),
			onComplete: vi.fn()
		}).kill()
		expect(raf).toHaveBeenCalled()
	})

	it('eases symmetrically, like power2.inOut', () => {
		expect(easeInOut(0)).toBe(0)
		expect(easeInOut(0.5)).toBe(0.5)
		expect(easeInOut(1)).toBe(1)
		expect(easeInOut(0.25)).toBeCloseTo(0.125)
		expect(easeInOut(0.75)).toBeCloseTo(0.875)
	})
})
