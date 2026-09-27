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

export default function useCameraTween(
	engine: RoomEngine | null,
	isReducedMotion: boolean
): CameraTween {
	const camera = useRef<CameraState>({ progress: 0, target: null })
	const tween = useRef<gsap.core.Tween | null>(null)
	const engineReference = useRef(engine)

	useEffect(() => {
		engineReference.current = engine
		engine?.setCamera(camera.current.target, camera.current.progress)
	}, [engine])

	useEffect(
		() => () => {
			tween.current?.kill()
		},
		[]
	)

	const jumpTo = useCallback(async (target: ObjectId | null, value: number) => {
		tween.current?.kill()
		camera.current = { progress: value, target }
		engineReference.current?.setCamera(target, value)
	}, [])

	const flyTo = useCallback(
		async (target: ObjectId, to: number) =>
			new Promise<void>(resolve => {
				tween.current?.kill()
				if (camera.current.target !== target)
					camera.current = { progress: 0, target }
				const state = camera.current
				tween.current = gsap.to(state, {
					progress: to,
					duration: isReducedMotion ? 0 : 0.9,
					ease: 'power2.inOut',
					onUpdate: () =>
						engineReference.current?.setCamera(target, state.progress),
					onComplete: () => {
						engineReference.current?.setCamera(target, state.progress)
						resolve()
					}
				})
			}),
		[isReducedMotion]
	)

	return useMemo(() => ({ flyTo, jumpTo }), [flyTo, jumpTo])
}
