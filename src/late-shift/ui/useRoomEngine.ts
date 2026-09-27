import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createRoomEngine, type RoomEngine } from '../engine/roomEngine'
import { chooseLayout, type LayoutName } from '../scene/layouts'

interface UseRoomEngineOptions {
	readonly canvasReference: RefObject<HTMLCanvasElement>
	readonly stageReference: RefObject<HTMLDivElement>
	readonly isReducedMotion: boolean
}

export default function useRoomEngine({
	canvasReference,
	stageReference,
	isReducedMotion
}: UseRoomEngineOptions) {
	const [engine, setEngine] = useState<RoomEngine | null>(null)
	const [hasFailed, setHasFailed] = useState(false)
	const [layoutName, setLayoutName] = useState<LayoutName>(() =>
		chooseLayout(window.innerWidth, window.innerHeight)
	)
	const coveredReference = useRef(false)
	const syncReference = useRef<() => void>()

	useEffect(() => {
		const canvas = canvasReference.current
		const stage = stageReference.current
		if (!canvas || !stage) return undefined
		const box = stage.getBoundingClientRect()
		const initialLayout = chooseLayout(window.innerWidth, window.innerHeight)
		const onEngineError = () => setHasFailed(true)
		let created: RoomEngine
		try {
			created = createRoomEngine(canvas, {
				layout: initialLayout,
				width: box.width,
				height: box.height,
				isReducedMotion,
				dpr: Math.min(window.devicePixelRatio || 1, 2),
				onError: onEngineError
			})
		} catch {
			setHasFailed(true)
			return undefined
		}
		setEngine(created)

		// Rebuilding plates is expensive: only do it when the layout or stage size changed
		let applied = `${initialLayout}:${box.width}x${box.height}`
		const onResize = () => {
			const name = chooseLayout(window.innerWidth, window.innerHeight)
			const rect = stage.getBoundingClientRect()
			const next = `${name}:${rect.width}x${rect.height}`
			if (next === applied) return
			applied = next
			setLayoutName(name)
			created.setLayout(name, rect.width, rect.height)
		}
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(stage)
		window.addEventListener('resize', onResize)

		let isHidden = document.hidden
		let isOffscreen = false
		const sync = () =>
			created.setPaused(isHidden || isOffscreen || coveredReference.current)
		syncReference.current = sync
		const onVisibility = () => {
			isHidden = document.hidden
			sync()
		}
		document.addEventListener('visibilitychange', onVisibility)
		const intersection = new IntersectionObserver(entries => {
			isOffscreen = !entries.some(entry => entry.isIntersecting)
			sync()
		})
		intersection.observe(stage)

		return () => {
			resizeObserver.disconnect()
			intersection.disconnect()
			window.removeEventListener('resize', onResize)
			document.removeEventListener('visibilitychange', onVisibility)
			syncReference.current = undefined
			created.destroy()
			setEngine(null)
		}
	}, [canvasReference, stageReference, isReducedMotion])

	const setCovered = useCallback((covered: boolean) => {
		coveredReference.current = covered
		syncReference.current?.()
	}, [])

	return { engine, layoutName, hasFailed, setCovered }
}
