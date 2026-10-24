package portfolio

import org.jetbrains.compose.web.testutils.ComposeWebExperimentalTestsApi
import org.jetbrains.compose.web.testutils.runTest
import org.w3c.dom.Element
import org.w3c.dom.asList
import portfolio.content.experience
import portfolio.content.profile
import portfolio.content.projects
import portfolio.content.skills
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@OptIn(ComposeWebExperimentalTestsApi::class)
class HomeTest {
	private fun Element.all(selector: String) = querySelectorAll(selector).asList().map { it as Element }

	@Test
	fun hasLandmarksAndOneH1WithTheName() = runTest {
		composition { Home() }
		assertNotNull(root.querySelector("header"))
		assertEquals("main", root.querySelector("main")?.id)
		assertNotNull(root.querySelector("footer"))
		assertEquals(listOf(profile.name), root.all("h1").map { it.textContent })
	}

	@Test
	fun ordersTheSectionHeadings() = runTest {
		composition { Home() }
		assertEquals(listOf("Work", "Experience", "Tools", "Contact"), root.all("h2").map { it.textContent })
		root.all("section").forEach { section ->
			assertNotNull(root.querySelector("#${section.getAttribute("aria-labelledby")}"))
		}
	}

	@Test
	fun listsEveryProjectWithLinksThatOpenInANewTab() = runTest {
		composition { Home() }
		val headings = root.all("h3").map { it.textContent }
		projects.forEach { assertTrue(it.name in headings, "missing ${it.name}") }
		val football = root.all("a").single { it.getAttribute("href") == "https://football.olivershooter.com" }
		assertEquals("football.olivershooter.com (opens in new tab)", football.textContent)
		assertEquals("_blank", football.getAttribute("target"))
		assertEquals("noreferrer", football.getAttribute("rel"))
	}

	@Test
	fun everyExternalLinkOpensSafelyAndIsTracked() = runTest {
		composition { Home() }
		val external = root.all("a[target='_blank']")
		assertEquals(projects.sumOf { it.links.size } + 2, external.size, "project links, GitHub and LinkedIn")
		external.forEach {
			assertEquals("noreferrer", it.getAttribute("rel"))
			assertTrue(it.textContent.orEmpty().endsWith("(opens in new tab)"))
			assertNotNull(it.getAttribute("data-umami-event"), "untracked link ${it.getAttribute("href")}")
		}
	}

	@Test
	fun tagsProjectLinksWithTheProjectAndContactLinksWithTheMethod() = runTest {
		composition { Home() }
		val appStore = root.all("a").single { it.getAttribute("data-umami-event-kind") == "AppStore" }
		assertEquals("project-link", appStore.getAttribute("data-umami-event"))
		assertEquals("Salah Times", appStore.getAttribute("data-umami-event-project"))
		assertEquals("Get it on the App Store (opens in new tab)", appStore.textContent)
		assertEquals(
			listOf("email", "github", "linkedin"),
			root.all("a[data-umami-event='contact']").map { it.getAttribute("data-umami-event-method") },
		)
	}

	@Test
	fun skipLinkLandsOnTheFocusableMain() = runTest {
		composition { Home() }
		assertEquals("#main", root.querySelector(".home-skip")?.getAttribute("href"))
		assertEquals("-1", root.querySelector("main")?.getAttribute("tabindex"))
	}

	@Test
	fun showsTheCareerBeforeSoftwareAndEverySkillGroup() = runTest {
		composition { Home() }
		assertTrue(profile.before.title in root.all("h3").map { it.textContent })
		val text = root.textContent.orEmpty()
		skills.forEach { assertTrue(it.title in text && it.items.joinToString() in text, "missing ${it.title}") }
	}

	@Test
	fun showsEveryRoleAndTheEmail() = runTest {
		composition { Home() }
		val text = root.textContent.orEmpty()
		experience.forEach { assertTrue(it.title in text, "missing ${it.title}") }
		assertEquals(1, root.all("a[href='mailto:${profile.email}']").size)
	}
}
