import { cameraTarget, cameraTransform } from '../scene/camera'
import { LAYOUTS, type LayoutName } from '../scene/layouts'
import { ROOM_OBJECTS, type ObjectId } from '../scene/objects'
import { GRAIN } from '../scene/palette'
import { drawRoom } from '../scene/room'
import type { RoomRenderState } from '../scene/state'
import { TOD, approachTod, resolveTod, type TodMode } from '../scene/timeOfDay'
import { createCompositor } from './compositor'
import { startLoop } from './loop'

export interface RoomEngine {
	readonly setLayout: (name: LayoutName, width: number, height: number) => void
	readonly setHover: (id: ObjectId | null) => void
	readonly setHighlight: (id: ObjectId | null) => void
	readonly setCamera: (id: ObjectId | null, progress: number) => void
	readonly setRadio: (on: boolean) => void
	readonly setTodMode: (mode: TodMode) => void
	readonly setPaused: (paused: boolean) => void
	readonly destroy: () => void
}

export interface RoomEngineOptions {
	readonly layout: LayoutName
	readonly width: number
	readonly height: number
	readonly isReducedMotion: boolean
	readonly dpr: number
}

/** Reduced motion renders a single, fixed moment of the animation. */
const STATIC_TIME = 12

export function createRoomEngine(
	canvas: HTMLCanvasElement,
	options: RoomEngineOptions
): RoomEngine {
	const compositor = createCompositor(canvas, {
		dpr: options.dpr,
		grain: GRAIN
	})
	compositor.resize(options.width, options.height)
	let layout = LAYOUTS[options.layout]
	let todMode: TodMode = 'auto'
	let tod = TOD[resolveTod(todMode, new Date())]
	let hoverId: ObjectId | null = null
	let highlightId: ObjectId | null = null
	const hover: Partial<Record<ObjectId, number>> = {}
	let cameraId: ObjectId | null = null
	let cameraProgress = 0
	let radioOn = false
	let reelAngle = 0
	let dirty = true

	void document.fonts.load('16px "Archivo Black"').then(() => {
		dirty = true
	})

	const frame = (seconds: number, dt: number) => {
		const target = TOD[resolveTod(todMode, new Date())]
		tod = options.isReducedMotion
			? target
			: approachTod(tod, target, 1 - Math.exp(-dt * 2.5))
		let isSettling = false
		for (const object of ROOM_OBJECTS) {
			const goal = object.id === hoverId || object.id === highlightId ? 1 : 0
			const current = hover[object.id] ?? 0
			const next = options.isReducedMotion
				? goal
				: current + (goal - current) * (1 - Math.exp(-dt * 14))
			if (Math.abs(next - current) > 0.001) isSettling = true
			hover[object.id] = next
		}
		if (radioOn) reelAngle += dt * 5
		if (options.isReducedMotion && !dirty && !isSettling) return
		dirty = false
		const time = options.isReducedMotion ? STATIC_TIME : seconds
		const state: RoomRenderState = {
			layout,
			tod,
			hover,
			camera: cameraTransform(
				layout,
				cameraId ? cameraTarget(layout, cameraId) : null,
				cameraProgress
			),
			phoneReveal: cameraId === 'android' ? cameraProgress : 0,
			radioOn,
			reelAngle,
			isLightRain: layout.name === 'phone'
		}
		compositor.render(time, layout, (ink, g) => drawRoom(ink, g, time, state))
	}

	const loop = startLoop(frame)

	return {
		setLayout: (name, width, height) => {
			layout = LAYOUTS[name]
			compositor.resize(width, height)
			dirty = true
		},
		setHover: id => {
			hoverId = id
			dirty = true
		},
		setHighlight: id => {
			highlightId = id
			dirty = true
		},
		setCamera: (id, progress) => {
			cameraId = id
			cameraProgress = progress
			dirty = true
		},
		setRadio: on => {
			radioOn = on
			dirty = true
		},
		setTodMode: mode => {
			todMode = mode
			dirty = true
		},
		setPaused: paused => loop.setPaused(paused),
		destroy: () => loop.stop()
	}
}
