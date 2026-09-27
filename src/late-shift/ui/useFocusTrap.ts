import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
	'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function useFocusTrap(
	containerReference: RefObject<HTMLElement>,
	onEscape: () => void
): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const container = containerReference.current
			if (!container) return
			if (event.key === 'Escape') {
				event.preventDefault()
				onEscape()
				return
			}
			if (event.key !== 'Tab') return
			const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
			const first = items.at(0)
			const last = items.at(-1)
			if (!first || !last) return
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [containerReference, onEscape])
}
