package portfolio.content

data class Role(
	val id: String,
	val title: String,
	val org: String,
	val period: String,
	val bullets: List<String>,
)

val experience = listOf(
	Role(
		id = "deloitte",
		title = "Senior Consultant · Software Engineer",
		org = "Deloitte",
		period = "Feb 2026 – Present",
		bullets = listOf(
			"Android engineer since June 2026, working on an app built to serve millions of people.",
			"Before that, lead developer on a proof of concept for AI-led development: " +
				"fixed the process as we went and got proprietary APIs and existing systems working together.",
		),
	),
	Role(
		id = "government-se",
		title = "Software Engineer",
		org = "Government",
		period = "Jun 2023 – Feb 2026",
		bullets = listOf(
			"Built a full-stack onboarding app (React + Spring Boot + OpenShift). Every new starter now uses it.",
			"Rewrote a static HTML prototype as React/Vite + FastAPI + MongoDB. Added WCAG 2.1 compliance. All project customers use it.",
			"Wrote middleware that automates manual workflows between two internal services. MongoDB-backed, runs on OKD.",
			"Broke apart a monolithic monitoring stack into microservices with Helm, Kubernetes, Grafana, Loki, Mimir, and Tempo.",
		),
	),
	Role(
		id = "government-jr",
		title = "Junior Software Engineer",
		org = "Government",
		period = "Oct 2022 – Jun 2023",
		bullets = listOf(
			"Migrated Create React App to Vite. Build times dropped, dependency vulnerabilities went with them.",
			"Turned Figma mockups into React/TypeScript components.",
			"Worked on Spring Boot backends: API integrations and data persistence.",
		),
	),
)
