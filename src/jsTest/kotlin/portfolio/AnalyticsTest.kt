package portfolio

import kotlinx.browser.window
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals

class AnalyticsTest {
	private val calls = mutableListOf<Pair<String, dynamic>>()

	private fun installUmami(track: (String, dynamic) -> Unit) {
		window.asDynamic().umami = js("({})")
		window.asDynamic().umami.track = track
	}

	@AfterTest
	fun removeUmami() {
		js("delete window.umami")
	}

	@Test
	fun roundsMillisecondsAndKeepsThreeDecimalsOfLayoutShift() {
		assertEquals(1235.0, vitalEvent("LCP", 1234.56, "good")["value"])
		assertEquals(0.123, vitalEvent("CLS", 0.12345, "good")["value"])
		assertEquals(mapOf("metric" to "INP", "value" to 88.0, "rating" to "good"), vitalEvent("INP", 88.4, "good"))
	}

	@Test
	fun sendsTheEventAndItsData() {
		installUmami { event, data -> calls += event to data }
		track("web-vital", vitalEvent("LCP", 2400.2, "needs-improvement"))
		val (event, data) = calls.single()
		assertEquals("web-vital", event)
		assertEquals("LCP", data.metric)
		assertEquals(2400, data.value)
		assertEquals("needs-improvement", data.rating)
	}

	@Test
	fun doesNothingWhenUmamiIsMissingOrBroken() {
		track("web-vital", mapOf("metric" to "LCP"))
		installUmami { _, _ -> throw Error("blocked by an ad blocker") }
		track("web-vital", mapOf("metric" to "LCP"))
	}
}
