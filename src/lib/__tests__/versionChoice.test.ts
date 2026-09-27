import {
	VERSION_KEY,
	forgetVersion,
	getRememberedVersion,
	isVersion,
	landingRedirect,
	rememberVersion
} from '../versionChoice'

describe('version choice', () => {
	it('recognises only the two versions', () => {
		expect(isVersion('quick')).toBe(true)
		expect(isVersion('late-shift')).toBe(true)
		expect(isVersion('fancy')).toBe(false)
		expect(isVersion(null)).toBe(false)
	})

	it('remembers and forgets a choice', () => {
		rememberVersion('quick')
		expect(getRememberedVersion()).toBe('quick')
		forgetVersion()
		expect(getRememberedVersion()).toBeNull()
	})

	it('redirects "/" to a remembered version', () => {
		rememberVersion('late-shift')
		expect(landingRedirect('')).toBe('/late-shift')
	})

	it('shows the chooser and clears the memory with ?choose', () => {
		rememberVersion('quick')
		expect(landingRedirect('?choose')).toBeNull()
		expect(getRememberedVersion()).toBeNull()
	})

	it('shows the chooser when the stored value is corrupted', () => {
		window.localStorage.setItem(VERSION_KEY, 'fancy')
		expect(getRememberedVersion()).toBeNull()
		expect(landingRedirect('')).toBeNull()
	})
})
