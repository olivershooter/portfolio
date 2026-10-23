package portfolio

import portfolio.content.experience
import portfolio.content.profile
import portfolio.content.projects
import portfolio.content.skills
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ContentTest {
	@Test
	fun hasTheFilmAndStudyBeatsTheHomePageReads() {
		assertTrue(profile.story.size >= 2)
		assertEquals("Manchester", profile.city)
	}

	@Test
	fun everyRoleAndProjectIsFilledIn() {
		assertTrue(experience.all { it.bullets.isNotEmpty() })
		assertTrue(projects.all { it.links.isNotEmpty() && it.links.values.all { url -> url.startsWith("https://") } })
		assertEquals(projects.size, projects.map { it.id }.toSet().size)
		assertTrue(skills.all { it.items.isNotEmpty() })
	}
}
