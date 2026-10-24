package portfolio

import org.jetbrains.compose.web.renderComposable

fun main() {
	renderComposable(rootElementId = "root") { Home() }
	reportWebVitals()
}
