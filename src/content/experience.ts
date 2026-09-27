import type { Role } from './types'

export const experience: readonly Role[] = [
	{
		id: 'deloitte',
		title: 'Senior Consultant · Software Engineer',
		org: 'Deloitte',
		period: 'Feb 2026 – Present',
		isCurrent: true,
		summary:
			'Consulting at Deloitte, where my work is now native Android in Kotlin and Jetpack Compose.',
		bullets: [
			'Sit inside client delivery teams: build it, ship it, move on to the next one.',
			'Build apps that need to be fast and accessible, turning messy requirements into components that make sense.',
			'Work across design, product and backend to keep the front end consistent across projects.',
			'Have a say in technical direction, and mentor other engineers when I can.'
		],
		stack: ['Kotlin', 'Jetpack Compose', 'React', 'TypeScript', 'Next.js'],
		file: 'deloitte.kt'
	},
	{
		id: 'government-se',
		title: 'Software Engineer',
		org: 'Government',
		period: 'Jun 2023 – Feb 2026',
		isCurrent: false,
		summary: 'Owned full-stack systems end to end.',
		bullets: [
			'Built a full-stack onboarding app (React + Spring Boot + OpenShift). Every new starter now uses it.',
			'Rewrote a static HTML prototype as React/Vite + FastAPI + MongoDB. Added WCAG 2.1 compliance. All project customers use it.',
			'Wrote middleware that automates manual workflows between two internal services. MongoDB-backed, runs on OKD.',
			'Broke apart a monolithic monitoring stack into microservices with Helm, Kubernetes, Grafana, Loki, Mimir, and Tempo.'
		],
		stack: [
			'React',
			'FastAPI',
			'Spring Boot',
			'MongoDB',
			'Kubernetes',
			'Helm',
			'Grafana',
			'OpenShift'
		],
		file: 'government_se.kt'
	},
	{
		id: 'government-jr',
		title: 'Junior Software Engineer',
		org: 'Government',
		period: 'Oct 2022 – Jun 2023',
		isCurrent: false,
		summary: 'Learned to ship in a real team.',
		bullets: [
			'Migrated Create React App to Vite. Build times dropped, dependency vulnerabilities went with them.',
			'Turned Figma mockups into React/TypeScript components that actually shipped.',
			'Worked on Spring Boot backends: API integrations and data persistence.',
			'Lots of pair programming, code reviews, and sprint refinements.'
		],
		stack: ['React', 'TypeScript', 'Java', 'Spring Boot', 'AWS'],
		file: 'government_jr.kt'
	}
]
