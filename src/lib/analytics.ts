type EventData = Readonly<Record<string, boolean | number | string>>

interface Umami {
	track: (event: string, data?: EventData) => void
}

declare global {
	interface Window {
		umami?: Umami
	}
}

export type AnalyticsEvent =
	| 'radio-toggled'
	| 'section-opened'
	| 'version-chosen'

export function track(event: AnalyticsEvent, data: EventData): void {
	try {
		window.umami?.track(event, data)
	} catch {
		// Analytics must never break the page
	}
}
