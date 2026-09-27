import { readStored, removeStored, writeStored } from './storage'

export type Version = 'late-shift' | 'quick'

export const VERSION_KEY = 'os-portfolio:version'

export const VERSION_PATHS: Readonly<Record<Version, string>> = {
	'late-shift': '/late-shift',
	quick: '/quick'
}

export function isVersion(value: string | null): value is Version {
	return value === 'late-shift' || value === 'quick'
}

export function getRememberedVersion(): Version | null {
	const value = readStored('local', VERSION_KEY)
	return isVersion(value) ? value : null
}

export function rememberVersion(version: Version): void {
	writeStored('local', VERSION_KEY, version)
}

export function forgetVersion(): void {
	removeStored('local', VERSION_KEY)
}

/** Where "/" should send the visitor, or null to show the chooser. */
export function landingRedirect(search: string): string | null {
	if (new URLSearchParams(search).has('choose')) {
		forgetVersion()
		return null
	}
	const remembered = getRememberedVersion()
	return remembered ? VERSION_PATHS[remembered] : null
}
