package portfolio

import androidx.compose.runtime.Composable
import org.jetbrains.compose.web.attributes.ATarget
import org.jetbrains.compose.web.attributes.target
import org.jetbrains.compose.web.dom.A
import org.jetbrains.compose.web.dom.Article
import org.jetbrains.compose.web.dom.ContentBuilder
import org.jetbrains.compose.web.dom.Div
import org.jetbrains.compose.web.dom.Footer
import org.jetbrains.compose.web.dom.H1
import org.jetbrains.compose.web.dom.H2
import org.jetbrains.compose.web.dom.H3
import org.jetbrains.compose.web.dom.Header
import org.jetbrains.compose.web.dom.Li
import org.jetbrains.compose.web.dom.Main
import org.jetbrains.compose.web.dom.P
import org.jetbrains.compose.web.dom.Section
import org.jetbrains.compose.web.dom.Span
import org.jetbrains.compose.web.dom.Text
import org.jetbrains.compose.web.dom.Ul
import org.w3c.dom.HTMLElement
import org.w3c.dom.url.URL
import portfolio.content.LinkKind
import portfolio.content.experience
import portfolio.content.profile
import portfolio.content.projects
import portfolio.content.skills
import kotlin.js.Date

private val year = Date().getFullYear()

/** Live sites read best as their own address; stores and code keep a label. */
private fun linkText(kind: LinkKind, href: String) =
	if (kind == LinkKind.Live) URL(href).host else kind.label

@Composable
private fun ExternalLink(href: String, text: String, className: String = "home-link") {
	A(href, {
		classes(className)
		target(ATarget.Blank)
		attr("rel", "noreferrer")
	}) {
		Text(text)
		Span({ classes("sr-only") }) { Text(" (opens in new tab)") }
	}
}

/** A titled column of the page; the heading names the landmark for screen readers. */
@Composable
private fun HomeSection(id: String, title: String, content: ContentBuilder<HTMLElement>) {
	Section({
		classes("home-col")
		attr("aria-labelledby", "$id-heading")
	}) {
		H2({
			id("$id-heading")
			classes("home-heading")
		}) { Text(title) }
		content()
	}
}

@Composable
fun Home() {
	val (firstName, lastName) = profile.name.split(' ', limit = 2)
	val (film, study) = profile.story

	Div({ classes("home") }) {
		A("#main", { classes("home-skip") }) { Text("Skip to content") }

		Header({ classes("home-hero") }) {
			Div({ classes("home-intro") }) {
				P({ classes("home-strong") }) { Text("${profile.title}, ${profile.city}") }
				P({ classes("home-muted") }) { Text(profile.shortBio) }
			}
			H1({ classes("home-name") }) {
				Span { Text(firstName) }
				Text(" ")
				Span({ classes("home-name-indent") }) { Text(lastName) }
			}
		}

		Main({
			id("main")
			tabIndex(-1)
			classes("home-main")
		}) {
			HomeSection("work", "Work") {
				projects.forEach { project ->
					Article {
						H3({ classes("home-display", "home-project") }) { Text(project.name) }
						P({ classes("home-gap") }) { Text(project.tagline) }
						P({ classes("home-muted") }) { Text(project.stack.joinToString()) }
						P({ classes("home-links") }) {
							project.links.forEach { (kind, href) -> ExternalLink(href, linkText(kind, href)) }
						}
					}
				}
			}

			HomeSection("experience", "Experience") {
				experience.forEach { role ->
					Article {
						P({ classes("home-muted") }) { Text(role.period) }
						H3({ classes("home-display", "home-org") }) { Text(role.org) }
						P({ classes("home-strong") }) { Text(role.title) }
						Ul({ classes("home-bullets") }) {
							role.bullets.forEach { Li { Text(it) } }
						}
					}
				}
				Article {
					P({ classes("home-muted") }) { Text("${film.year} to ${study.year}") }
					H3({ classes("home-display", "home-org") }) { Text(film.title) }
					P({ classes("home-gap") }) { Text("${film.text} ${study.text}") }
				}
			}

			HomeSection("tools", "Tools") {
				Div({ classes("home-tools") }) {
					skills.forEach { group ->
						Div {
							P({ classes("home-muted") }) { Text(group.title) }
							P { Text(group.items.joinToString()) }
						}
					}
				}
			}

			HomeSection("contact", "Contact") {
				P { Text(profile.contactMessage) }
				A("mailto:${profile.email}", { classes("home-link", "home-display", "home-email") }) {
					Text(profile.email)
				}
				P({ classes("home-links") }) {
					ExternalLink(profile.github, "GitHub")
					profile.linkedin?.let { ExternalLink(it, "LinkedIn") }
				}
			}
		}

		Footer({ classes("home-col", "home-footer") }) {
			P({ classes("home-muted") }) { Text("© $year ${profile.name}") }
		}
	}
}
