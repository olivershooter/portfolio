import { act, renderHook } from '@testing-library/react'
import type { RoomEngine } from '../../engine/roomEngine'
import useCameraTween from '../useCameraTween'

function setup(isReducedMotion = false) {
	const engine: RoomEngine = {
		setLayout: vi.fn(),
		setHover: vi.fn(),
		setHighlight: vi.fn(),
		setCamera: vi.fn(),
		setRadio: vi.fn(),
		setTodMode: vi.fn(),
		setPaused: vi.fn(),
		destroy: vi.fn()
	}
	const { result, rerender } = renderHook(
		({ isReduced }) => useCameraTween(engine, isReduced),
		{ initialProps: { isReduced: isReducedMotion } }
	)
	return { engine, result, rerender }
}

describe('useCameraTween', () => {
	it('arrives at once when the camera is already at the target', async () => {
		const { engine, result } = setup()
		await act(async () => result.current.jumpTo('android', 0.999))
		const started = performance.now()
		await act(async () => result.current.flyTo('android', 1))
		expect(performance.now() - started).toBeLessThan(200)
		expect(engine.setCamera).toHaveBeenLastCalledWith('android', 1)
	})

	it('flies back out of the current object before flying to a new one', async () => {
		const { engine, result } = setup()
		await act(async () => result.current.jumpTo('experience', 0.5))
		vi.mocked(engine.setCamera).mockClear()
		await act(async () => result.current.flyTo('skills', 1))
		const {calls} = vi.mocked(engine.setCamera).mock
		expect(calls[0][0]).toBe('experience')
		expect(calls[0][1]).toBeLessThanOrEqual(0.5)
		expect(calls.at(-1)).toEqual(['skills', 1])
	})

	it('keeps the same functions when reduced motion changes', () => {
		const { result, rerender } = setup(false)
		const before = result.current
		rerender({ isReduced: true })
		expect(result.current.flyTo).toBe(before.flyTo)
		expect(result.current.jumpTo).toBe(before.jumpTo)
	})
})
