import type { Box, ObjectId } from './objects'

export type LayoutName = 'desk' | 'phone'
export type PlaceId = ObjectId | 'lamp' | 'mug' | 'shelf'

export interface Placement {
	readonly x: number
	readonly y: number
	readonly s: number
	readonly ox: number
	readonly oy: number
}

export interface Layout {
	readonly name: LayoutName
	readonly vw: number
	readonly vh: number
	readonly deskY: number
	readonly phoneZoom: number
	readonly place: Readonly<Partial<Record<PlaceId, Placement>>>
}

const IDENTITY: Placement = { x: 0, y: 0, s: 1, ox: 0, oy: 0 }
const SHELF: Placement = { x: 240, y: 372, s: 0.8, ox: 770, oy: 140 }

export const LAYOUTS: Readonly<Record<LayoutName, Layout>> = {
	desk: {
		name: 'desk',
		vw: 1000,
		vh: 560,
		deskY: 410,
		phoneZoom: 3.9,
		place: {}
	},
	phone: {
		name: 'phone',
		vw: 420,
		vh: 780,
		deskY: 600,
		phoneZoom: 5.6,
		place: {
			contact: { x: 23, y: 40, s: 0.9, ox: 62, oy: 42 },
			screendle: { x: 22, y: 345, s: 0.85, ox: 508, oy: 62 },
			candice: { x: 118, y: 352, s: 0.85, ox: 622, oy: 80 },
			shelf: SHELF,
			about: SHELF,
			football: SHELF,
			experience: { x: 96, y: 469, s: 0.78, ox: 456, oy: 246 },
			android: { x: 318, y: 490, s: 0.95, ox: 738, oy: 296 },
			lamp: { x: 8, y: 504, s: 0.7, ox: 878, oy: 275 },
			radio: { x: 24, y: 627, s: 0.85, ox: 146, oy: 326 },
			mug: { x: 190, y: 635, s: 0.9, ox: 330, oy: 334 },
			skills: { x: 250, y: 652, s: 1, ox: 388, oy: 364 }
		}
	}
}

export const placement = (layout: Layout, id: PlaceId): Placement =>
	layout.place[id] ?? IDENTITY

export function transformPoint(
	layout: Layout,
	id: PlaceId,
	point: readonly [number, number]
): [number, number] {
	const p = placement(layout, id)
	return [p.x + (point[0] - p.ox) * p.s, p.y + (point[1] - p.oy) * p.s]
}

export function transformBox(layout: Layout, id: PlaceId, box: Box): Box {
	const [x, y] = transformPoint(layout, id, [box[0], box[1]])
	const { s } = placement(layout, id)
	return [x, y, box[2] * s, box[3] * s]
}

export const chooseLayout = (width: number, height: number): LayoutName =>
	height > width && width < 700 ? 'phone' : 'desk'
