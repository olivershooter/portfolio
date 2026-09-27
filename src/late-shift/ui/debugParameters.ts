import { ROOM_OBJECTS, type ObjectId } from '../scene/objects'
import type { TodMode } from '../scene/timeOfDay'

const TODS = new Set(['dawn', 'day', 'dusk', 'night'])

export function todFromSearch(search: URLSearchParams): TodMode {
	const value = search.get('tod')
	return value !== null && TODS.has(value) ? (value as TodMode) : 'auto'
}

export function hoverFromSearch(search: URLSearchParams): ObjectId | null {
	const value = search.get('hover')
	return ROOM_OBJECTS.find(object => object.id === value)?.id ?? null
}
