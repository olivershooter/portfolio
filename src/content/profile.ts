import type { Profile } from './types'

export const profile: Profile = {
	name: 'Oliver Shooter',
	title: 'Software & Android Engineer',
	location: 'Manchester, UK',
	email: 'contact@olivershooter.com',
	shortBio:
		'I build native Android apps in Kotlin and Jetpack Compose at Deloitte. Before that I built full-stack systems for Government, and before that I worked in film.',
	contactMessage:
		"Looking for engineering roles where the problems are hard and the team gives a damn. If that sounds like yours, I'd like to hear about it.",
	links: {
		github: 'https://github.com/olivershooter',
		site: 'https://olivershooter.com'
	},
	story: [
		{
			year: '2014',
			title: 'Film sets',
			text: 'Started in media production. Learned to tell stories and think visually.'
		},
		{
			year: '2020',
			title: 'The pivot',
			text: 'MSc Computer Science at the University of Birmingham.'
		},
		{
			year: '2021',
			title: 'Government',
			text: 'Joined Government as a junior engineer and started shipping.'
		},
		{
			year: '2023',
			title: 'Owning systems',
			text: 'Promoted to Software Engineer. Owned full-stack systems and ran a team.'
		},
		{
			year: 'Now',
			title: 'Deloitte · Android',
			text: 'Consulting at Deloitte, now building native Android apps in Kotlin and Jetpack Compose.'
		}
	]
}
