import { transformBox, type Layout } from './layouts'
import { ROOM_OBJECTS, type ObjectId } from './objects'

interface ClientRect {
	readonly left: number
	readonly top: number
	readonly width: number
	readonly height: number
}

export function toVirtual(
	layout: Layout,
	client: readonly [number, number],
	rect: ClientRect
): [number, number] {
	return [
		((client[0] - rect.left) / rect.width) * layout.vw,
		((client[1] - rect.top) / rect.height) * layout.vh
	]
}

export function hitTest(
	layout: Layout,
	point: readonly [number, number],
	isZoomed = false
): ObjectId | null {
	if (isZoomed) return null
	const [vx, vy] = point
	for (let index = ROOM_OBJECTS.length - 1; index >= 0; index -= 1) {
		const object = ROOM_OBJECTS[index]
		const [x, y, w, h] = transformBox(layout, object.id, object.box)
		if (vx >= x && vx <= x + w && vy >= y && vy <= y + h) return object.id
	}
	return null
}
