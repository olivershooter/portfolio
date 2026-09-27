export const MAX_DT = 0.05

export interface LoopHandle {
	readonly stop: () => void
	readonly setPaused: (paused: boolean) => void
	readonly isPaused: () => boolean
}

interface LoopDeps {
	readonly raf: (callback: FrameRequestCallback) => number
	readonly caf: (handle: number) => void
}

const browserDeps: LoopDeps = {
	raf: callback => window.requestAnimationFrame(callback),
	caf: handle => window.cancelAnimationFrame(handle)
}

export function startLoop(
	frame: (seconds: number, dt: number) => void,
	deps: LoopDeps = browserDeps
): LoopHandle {
	let handle = 0
	let last: number | null = null
	let elapsed = 0
	let paused = false
	let running = true

	const tick = (now: number) => {
		if (!running) return
		handle = deps.raf(tick)
		const dt =
			last === null ? 0 : Math.min(MAX_DT, Math.max(0, (now - last) / 1000))
		last = now
		if (paused) return
		elapsed += dt
		frame(elapsed, dt)
	}
	handle = deps.raf(tick)

	return {
		stop: () => {
			running = false
			deps.caf(handle)
		},
		setPaused: value => {
			paused = value
		},
		isPaused: () => paused
	}
}
