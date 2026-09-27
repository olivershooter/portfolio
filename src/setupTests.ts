import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import { setReducedMotion } from './testUtils'

const noRecords = (): never[] => []

class ObserverStub {
	public observe = vi.fn()

	public unobserve = vi.fn()

	public disconnect = vi.fn()

	public takeRecords = vi.fn(noRecords)
}

// Node 26 ships its own `localStorage` global (undefined without --localstorage-file),
// which shadows jsdom's. Point both Web Storage globals at jsdom's implementation.
// Tests that opt into the node environment (no jsdom) skip the browser stubs.
const { jsdom } = globalThis as unknown as {
	jsdom?: { window: { localStorage: Storage; sessionStorage: Storage } }
}
if (jsdom) {
	vi.stubGlobal('localStorage', jsdom.window.localStorage)
	vi.stubGlobal('sessionStorage', jsdom.window.sessionStorage)
	vi.stubGlobal('ResizeObserver', ObserverStub)
	vi.stubGlobal('IntersectionObserver', ObserverStub)
	vi.stubGlobal('scrollTo', vi.fn())
}

// ScrollTrigger needs real layout; components get a no-op hook, scrubAction stays real
vi.mock('./late-shift/ui/useScrollIntoPhone', async importOriginal => ({
	...(await importOriginal<
		typeof import('./late-shift/ui/useScrollIntoPhone')
	>()),
	default: vi.fn()
}))

beforeEach(() => {
	if (!jsdom) return
	setReducedMotion(false)
	window.localStorage.clear()
	window.sessionStorage.clear()
})
