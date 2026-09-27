import { useEffect, type RefObject } from 'react'

export type ScrubAction =
	| { readonly kind: 'camera'; readonly progress: number }
	| { readonly kind: 'open' }

export function scrubAction(progress: number): ScrubAction {
	return progress >= 0.999 ? { kind: 'open' } : { kind: 'camera', progress }
}

interface ScrollIntoPhoneOptions {
	readonly spacerReference: RefObject<HTMLElement>
	readonly isEnabled: boolean
	readonly onProgress: (progress: number) => void
	readonly onArrive: () => void
}

// ScrollTrigger needs real layout, so component tests stub this hook (setupTests.ts)
/* istanbul ignore next -- @preserve */
export default function useScrollIntoPhone({
	spacerReference,
	isEnabled,
	onProgress,
	onArrive
}: ScrollIntoPhoneOptions): void {
	useEffect(() => {
		const spacer = spacerReference.current
		if (!isEnabled || !spacer) return undefined
		let isActive = true
		let kill: (() => void) | undefined
		// GSAP loads only once scroll-scrub is needed, keeping it off the first paint
		void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([{ gsap }, { ScrollTrigger }]) => {
				if (!isActive) return
				gsap.registerPlugin(ScrollTrigger)
				const trigger = ScrollTrigger.create({
					trigger: spacer,
					start: 'top top',
					end: 'bottom bottom',
					onUpdate: self => {
						const action = scrubAction(self.progress)
						if (action.kind === 'open') onArrive()
						else onProgress(action.progress)
					}
				})
				kill = () => trigger.kill()
			}
		)
		return () => {
			isActive = false
			kill?.()
		}
	}, [spacerReference, isEnabled, onProgress, onArrive])
}
