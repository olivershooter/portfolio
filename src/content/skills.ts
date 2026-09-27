import type { SkillGroup } from './types'

export const skills: readonly SkillGroup[] = [
	{
		title: 'Android',
		spine: 'ANDROID',
		items: [
			'Kotlin',
			'Jetpack Compose',
			'Android SDK',
			'Google ML Kit',
			'React Native'
		]
	},
	{
		title: 'Languages',
		spine: 'LANGUAGES',
		items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'HTML/CSS']
	},
	{
		title: 'Frontend',
		spine: 'FRONTEND',
		items: ['React', 'Redux', 'TanStack', 'Vite', 'Tailwind CSS']
	},
	{
		title: 'Backend',
		spine: 'BACKEND',
		items: ['Spring Boot', 'FastAPI', 'Django', 'REST APIs', 'MongoDB', 'LDAP']
	},
	{
		title: 'Cloud & DevOps',
		spine: 'CLOUD',
		items: ['Kubernetes', 'Helm', 'Docker', 'OpenShift / OKD', 'AWS', 'CI/CD']
	},
	{
		title: 'Observability',
		spine: 'OBSERVABILITY',
		items: ['Grafana', 'Loki', 'Mimir', 'Tempo']
	},
	{
		title: 'Practice',
		spine: 'PRACTICE',
		items: [
			'Agile / Scrum',
			'TDD',
			'Pair programming',
			'Code review',
			'WCAG 2.1'
		]
	}
]
