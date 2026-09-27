/** Symmetric quadratic ease, the same curve as GSAP's power2.inOut. */
export function easeInOut(t: number): number {
	return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

export interface TweenOptions {
	readonly from: number
	readonly to: number
	/** Seconds; 0 finishes synchronously. */
	readonly duration: number
	readonly onUpdate: (value: number) => void
	readonly onComplete: () => void
}

export interface TweenHandle {
	readonly kill: () => void
}

interface FrameDeps {
	readonly raf: (callback: FrameRequestCallback) => number
	readonly caf: (handle: number) => void
}

const browserFrames: FrameDeps = {
	raf: callback => window.requestAnimationFrame(callback),
	caf: handle => window.cancelAnimationFrame(handle)
}

/** A tiny rAF tween, so the camera flight doesn't need GSAP on the critical path. */
export function tweenValue(
	{ from, to, duration, onUpdate, onComplete }: TweenOptions,
	deps: FrameDeps = browserFrames
): TweenHandle {
	if (duration <= 0) {
		onUpdate(to)
		onComplete()
		return { kill: () => {} }
	}
	let handle = 0
	let start: number | null = null
	let isKilled = false
	const step = (now: number) => {
		if (isKilled) return
		start ??= now
		const t = Math.min(1, (now - start) / (duration * 1000))
		onUpdate(from + (to - from) * easeInOut(t))
		if (t < 1) {
			handle = deps.raf(step)
			return
		}
		onComplete()
	}
	handle = deps.raf(step)
	return {
		kill: () => {
			isKilled = true
			deps.caf(handle)
		}
	}
}
