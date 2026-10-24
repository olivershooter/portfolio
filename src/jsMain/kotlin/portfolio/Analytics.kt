package portfolio

import kotlinx.browser.window
import kotlin.math.round

/** Sends an Umami event. Does nothing when Umami is blocked or hasn't loaded yet. */
fun track(event: String, data: Map<String, Any>) {
	val umami = window.asDynamic().umami ?: return
	val payload: dynamic = js("({})")
	data.forEach { (key, value) -> payload[key] = value }
	// Analytics must never break the page
	runCatching { umami.track(event, payload) }
}

/** Umami event data for one reading. CLS has no unit, so it keeps three decimals; the rest are whole milliseconds. */
fun vitalEvent(name: String, value: Double, rating: String): Map<String, Any> = mapOf(
	"metric" to name,
	"value" to if (name == "CLS") round(value * 1000) / 1000 else round(value),
	"rating" to rating,
)

/** Reports each visit's real load speed, layout shift and responsiveness to Umami as "web-vital" events. */
fun reportWebVitals() {
	val report = { metric: Metric -> track("web-vital", vitalEvent(metric.name, metric.value, metric.rating)) }
	onLCP(report)
	onCLS(report)
	onINP(report)
}
