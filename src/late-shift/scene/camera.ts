import { transformBox, transformPoint, type Layout } from './layouts'
import { ease } from './math'
import { getRoomObject, type ObjectId } from './objects'

export interface CameraTarget {
	readonly fx: number
	readonly fy: number
	readonly zoom: number
}

export interface CameraTransform {
	readonly scale: number
	readonly fx: number
	readonly fy: number
}

/** Centre of the phone's screen in desktop virtual units (the prototype's push-in focus). */
const PHONE_SCREEN_CENTRE = [771, 354] as const

export function cameraTarget(layout: Layout, id: ObjectId): CameraTarget {
	if (id === 'android') {
		const [fx, fy] = transformPoint(layout, 'android', PHONE_SCREEN_CENTRE)
		return { fx, fy, zoom: layout.phoneZoom }
	}
	const [x, y, w, h] = transformBox(layout, id, getRoomObject(id).box)
	const fit = 0.9 * Math.min(layout.vw / w, layout.vh / h)
	return { fx: x + w / 2, fy: y + h / 2, zoom: Math.max(0, fit - 1) }
}

export function cameraTransform(
	layout: Layout,
	target: CameraTarget | null,
	progress: number
): CameraTransform {
	const cx = layout.vw / 2
	const cy = layout.vh / 2
	if (!target) return { scale: 1, fx: cx, fy: cy }
	const eased = ease(progress)
	return {
		scale: 1 + target.zoom * eased * eased,
		fx: cx + (target.fx - cx) * eased,
		fy: cy + (target.fy - cy) * eased
	}
}
