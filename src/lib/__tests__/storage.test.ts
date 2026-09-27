import { readStored, removeStored, writeStored } from '../storage'

describe('storage', () => {
	it('reads, writes and removes values', () => {
		writeStored('local', 'k', 'v')
		expect(readStored('local', 'k')).toBe('v')
		writeStored('session', 'k', 's')
		expect(readStored('session', 'k')).toBe('s')
		removeStored('local', 'k')
		expect(readStored('local', 'k')).toBeNull()
	})

	it('never throws when storage is blocked', () => {
		const spy = vi
			.spyOn(window, 'localStorage', 'get')
			.mockImplementation(() => {
				throw new Error('SecurityError')
			})
		expect(readStored('local', 'k')).toBeNull()
		expect(() => writeStored('local', 'k', 'v')).not.toThrow()
		expect(() => removeStored('local', 'k')).not.toThrow()
		spy.mockRestore()
	})

	it('never throws when a storage call itself fails', () => {
		const failing = vi.fn(() => {
			throw new Error('QuotaExceededError')
		})
		const setItem = vi
			.spyOn(Storage.prototype, 'setItem')
			.mockImplementation(failing)
		const getItem = vi
			.spyOn(Storage.prototype, 'getItem')
			.mockImplementation(failing)
		const removeItem = vi
			.spyOn(Storage.prototype, 'removeItem')
			.mockImplementation(failing)
		expect(() => writeStored('session', 'k', 'v')).not.toThrow()
		expect(readStored('session', 'k')).toBeNull()
		expect(() => removeStored('session', 'k')).not.toThrow()
		setItem.mockRestore()
		getItem.mockRestore()
		removeItem.mockRestore()
	})
})
