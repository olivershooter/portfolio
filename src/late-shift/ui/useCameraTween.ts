import { gsap } from 'gsap'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RoomEngine } from '../engine/roomEngine'
import type { ObjectId } from '../scene/objects'

export interface CameraTween {
	readonly flyTo: (target: ObjectId, to: number) => Promise<void>
	readonly jumpTo: (target: ObjectId | null, value: number) => Promise<void>
}

interface CameraState {
	progress: number
	target: ObjectId | null
}

/** Seconds for a full room-to-object move. */
const FULL_FLIGHT = 0.9
/** Closer than this, a move isn't worth animating. */
const ARRIVED = 0.01

export default function useCameraTween(
	engine: RoomEngine | null,
	isReducedMotion: boolean
): CameraTween {
	const camera = useRef<CameraState>({ progress: 0, target: null })
	const tween = useRef<gsap.core.Tween | null>(null)
	const engineReference = useRef(engine)
	// Read at flight time, so flyTo keeps one identity and callers' effects don't re-run
	const reducedReference = useRef(isReducedMotion)

	useEffect(() => {
		engineReference.current = engine
		engine?.setCamera(camera.current.target, camera.current.progress)
	}, [engine])

	useEffect(() => {
		reducedReference.current = isReducedMotion
	}, [isReducedMotion])

	useEffect(
		() => () => {
			tween.current?.kill()
		},
		[]
	)

	const jumpTo = useCallback(
		async (target: ObjectId | null, value: number) => {
			tween.current?.kill()
			camera.current = { progress: value, target }
			engineReference.current?.setCamera(target, value)
		},
		[]
	)

	const animate = useCallback(
		async (target: ObjectId, to: number) =>
			new Promise<void>(resolve => {
				const state = camera.current
				const distance = Math.abs(to - state.progress)
				tween.current = gsap.to(state, {
					progress: to,
					duration: reducedReference.current ? 0 : FULL_FLIGHT * distance,
					ease: 'power2.inOut',
					onUpdate: () =>
						engineReference.current?.setCamera(target, state.progress),
					onComplete: () => {
						engineReference.current?.setCamera(target, state.progress)
						resolve()
					}
				})
			}),
		[]
	)

	const flyTo = useCallback(
		async (target: ObjectId, to: number) => {
			tween.current?.kill()
			const leaving = camera.current.target
			// Zoomed into something else: pull back out before heading to the new object
			if (
				leaving !== null &&
				leaving !== target &&
				camera.current.progress > ARRIVED
			)
				await animate(leaving, 0)
			if (camera.current.target !== target)
				camera.current = { progress: 0, target }
			if (Math.abs(to - camera.current.progress) < ARRIVED) {
				await jumpTo(target, to)
				return
			}
			await animate(target, to)
		},
		[animate, jumpTo]
	)

	return useMemo(() => ({ flyTo, jumpTo }), [flyTo, jumpTo])
}
