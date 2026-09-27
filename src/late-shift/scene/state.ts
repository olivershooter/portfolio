import type { CameraTransform } from './camera'
import type { Layout } from './layouts'
import type { Ink, Tri } from './math'
import type { ObjectId } from './objects'
import type { TodState } from './timeOfDay'

export interface RoomRenderState {
	readonly layout: Layout
	readonly tod: TodState
	readonly hover: Readonly<Partial<Record<ObjectId, number>>>
	readonly camera: CameraTransform
	/** 0..1: how far the phone screen has turned into the Android page. */
	readonly phoneReveal: number
	readonly radioOn: boolean
	readonly reelAngle: number
	readonly isLightRain: boolean
}

export interface SceneFrame {
	readonly g: CanvasRenderingContext2D
	readonly t: number
	readonly ink: Ink
	readonly k: (tri: Tri) => number
	readonly state: RoomRenderState
}
