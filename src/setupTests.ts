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
const { jsdom } = globalThis as unknown as {
	jsdom: { window: { localStorage: Storage; sessionStorage: Storage } }
}
vi.stubGlobal('localStorage', jsdom.window.localStorage)
vi.stubGlobal('sessionStorage', jsdom.window.sessionStorage)
vi.stubGlobal('ResizeObserver', ObserverStub)
vi.stubGlobal('IntersectionObserver', ObserverStub)

beforeEach(() => {
	setReducedMotion(false)
	window.localStorage.clear()
	window.sessionStorage.clear()
})
