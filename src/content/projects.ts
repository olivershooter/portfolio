import type { Project } from './types'

export const projects: readonly Project[] = [
	{
		id: 'football',
		name: 'Football Statistics',
		tagline: 'Free sports analytics. No sign-ups, no paywalls.',
		description:
			'Match results, live stats, timelines, and highlights for football. React/TypeScript frontend, Python/FastAPI backend pulling from third-party APIs. Completely free to use.',
		stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python'],
		platform: 'web',
		links: { live: 'https://football.olivershooter.com' },
		image: '/images/football.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Wireframe illustration of a floodlit football stadium seen from above'
	},
	{
		id: 'salah-times',
		name: 'Salah Times',
		tagline: 'Prayer times app. Accurate, offline-ready.',
		description:
			'React Native app for prayer times. Sky backgrounds change from dawn to night. Picks the right calculation source for your country (JAKIM, Kemenag, Al-Adhan) automatically. Push notifications, countdowns, works offline.',
		stack: ['React Native', 'Expo', 'TypeScript'],
		platform: 'mobile',
		links: {
			appStore: 'https://apps.apple.com/gb/app/simple-salah-times/id6760982824'
		},
		image: '/images/salah.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Salah Times screen showing the next prayer, Fajr, with a countdown ring on a starry night sky'
	},
	{
		id: 'screendle',
		name: 'Screendle',
		tagline: 'Daily movie guessing game. Five clues, five guesses.',
		description:
			'Wordle but for films. You get clues one at a time (synopsis, release date, runtime, box office, actors) and five guesses to name the movie. Answers validated server-side, new games generated weekly, holiday themes for fun.',
		stack: ['React', 'TypeScript', 'Vite', 'Express', 'PostgreSQL'],
		platform: 'web',
		links: { live: 'https://screendle.com' },
		image: '/images/screendle.png',
		imageSize: { width: 1200, height: 630 },
		alt: 'Screendle title card: a clapperboard next to the line "Name that film before the credits roll. Five clues. Five guesses."'
	},
	{
		id: 'candice',
		name: 'Candice',
		tagline: 'Language translation on Android. Works offline.',
		description:
			'Android app for translating text, speech, and images using Google ML Kit. Has translation history, a flashcard game, and downloadable language models so it works without internet. Local NoSQL storage.',
		stack: ['Java', 'Android', 'Google ML Kit', 'NoSQL'],
		platform: 'android',
		links: { github: 'https://github.com/olivershooter/candice' },
		image: '/images/candice.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Abstract illustration of letters from many alphabets swirling into glowing, connected nodes'
	}
]
