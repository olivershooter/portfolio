import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
		return () => trigger.kill()
	}, [spacerReference, isEnabled, onProgress, onArrive])
}
