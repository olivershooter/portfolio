type StorageKind = 'local' | 'session'

function getStore(kind: StorageKind): Storage | null {
	try {
		return kind === 'local' ? window.localStorage : window.sessionStorage
	} catch {
		return null
	}
}

export function readStored(kind: StorageKind, key: string): string | null {
	try {
		return getStore(kind)?.getItem(key) ?? null
	} catch {
		return null
	}
}

export function writeStored(
	kind: StorageKind,
	key: string,
	value: string
): void {
	try {
		getStore(kind)?.setItem(key, value)
	} catch {
		// Storage is full or blocked (private mode): the site works without it
	}
}

export function removeStored(kind: StorageKind, key: string): void {
	try {
		getStore(kind)?.removeItem(key)
	} catch {
		// Storage is blocked: nothing to remove
	}
}
