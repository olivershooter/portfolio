@file:JsModule("web-vitals")
@file:JsNonModule

package portfolio

/** The fields this site reads from a web-vitals reading. */
external interface Metric {
	val name: String
	val value: Double
	val rating: String
}

// Each reports once per visit: LCP on the first interaction, CLS and INP when the page is hidden
external fun onLCP(report: (Metric) -> Unit)
external fun onCLS(report: (Metric) -> Unit)
external fun onINP(report: (Metric) -> Unit)
