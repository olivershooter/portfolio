import { act, renderHook } from '@testing-library/react'
import { setReducedMotion } from '../../testUtils'
import useReducedMotion from '../useReducedMotion'

describe('useReducedMotion', () => {
	it('is false by default', () => {
		const { result } = renderHook(() => useReducedMotion())
		expect(result.current).toBe(false)
	})

	it('is true when the user prefers reduced motion', () => {
		setReducedMotion(true)
		const { result } = renderHook(() => useReducedMotion())
		expect(result.current).toBe(true)
	})

	it('follows changes to the preference', () => {
		let isReduced = false
		let onChange: () => void = vi.fn()
		const media = {
			get matches() {
				return isReduced
			},
			addEventListener: (_type: string, listener: () => void) => {
				onChange = listener
			},
			removeEventListener: vi.fn()
		}
		vi.stubGlobal('matchMedia', () => media)
		const { result, unmount } = renderHook(() => useReducedMotion())
		expect(result.current).toBe(false)
		isReduced = true
		act(() => onChange())
		expect(result.current).toBe(true)
		unmount()
		expect(media.removeEventListener).toHaveBeenCalled()
	})
})
