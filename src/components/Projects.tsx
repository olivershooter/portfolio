import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const projects = [
	{
		index: '01',
		title: 'Football Statistics',
		tagline: 'Free sports analytics. No sign-ups, no paywalls.',
		description:
			'Match results, live stats, timelines, and highlights for football. React/TypeScript frontend, Python/FastAPI backend pulling from third-party APIs. Completely free to use.',
		stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python'],
		live: 'https://football.olivershooter.com',
		image: '/images/football.png',
		accent: 'border-primary'
	},
	{
		index: '02',
		title: 'Salah Times',
		tagline: 'Prayer times app. Accurate, offline-ready.',
		description:
			'React Native app for prayer times. Sky backgrounds change from dawn to night. Picks the right calculation source for your country (JAKIM, Kemenag, Al-Adhan) automatically. Push notifications, countdowns, works offline.',
		stack: ['React Native', 'Expo', 'TypeScript'],
		live: 'https://apps.apple.com/gb/app/simple-salah-times/id6760982824',
		image: '/images/salah.png',
		accent: 'border-surface-highest'
	},
	{
		index: '03',
		title: 'Screendle',
		tagline: 'Daily movie guessing game. Five clues, five guesses.',
		description:
			'Wordle but for films. You get clues one at a time (synopsis, release date, runtime, box office, actors) and five guesses to name the movie. Answers validated server-side, new games generated weekly, holiday themes for fun.',
		stack: ['React', 'TypeScript', 'Vite', 'Express', 'PostgreSQL'],
		live: 'https://screendle.com',
		image: '/images/screendle.png',
		accent: 'border-surface-highest'
	},
	{
		index: '04',
		title: 'Candice',
		tagline: 'Language translation on Android. Works offline.',
		description:
			'Android app for translating text, speech, and images using Google ML Kit. Has translation history, a flashcard game, and downloadable language models so it works without internet. Local NoSQL storage.',
		stack: ['Java', 'Android', 'Google ML Kit', 'NoSQL'],
		github: 'https://github.com/olivershooter/candice',
		image: '/images/candice.png',
		accent: 'border-surface-highest'
	}
]

export default function Projects() {
	const cardsReference = useRef<HTMLDivElement[]>([])

	useEffect(() => {
		const context = gsap.context(() => {
			for (const card of cardsReference.current) {
				gsap.fromTo(
					card,
					{ opacity: 0, y: 80 },
					{
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: card,
							start: 'top 75%',
							toggleActions: 'play none none none'
						}
					}
				)
			}
		})
		return () => context.revert()
	}, [])

	return (
		<section
			id='projects'
			className='bg-surface px-4 py-24 md:px-16 md:py-32 lg:px-24'
		>
			<div className='mx-auto max-w-6xl'>
				<div className='mb-20 flex items-start justify-between'>
					<div>
						<span className='mb-4 block font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
							03 / Projects
						</span>
						<h2
							className='font-headline font-black leading-[0.9] tracking-tight text-text-base'
							style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
						>
							Shipped.
							<br />
							<span className='text-primary'>In the wild.</span>
						</h2>
					</div>
				</div>

				<div className='space-y-6'>
					{projects.map((project, index) => (
						<div
							key={project.index}
							ref={element => {
								if (element) cardsReference.current[index] = element
							}}
							className={`group relative overflow-hidden border-l-4 bg-bg ${project.accent} flex flex-col transition-all duration-500 hover:border-primary md:flex-row`}
						>
							{/* Image */}
							<div className='relative h-64 flex-shrink-0 overflow-hidden md:h-auto md:w-[45%]'>
								<img
									src={project.image}
									alt={project.title}
									className='h-full w-full object-cover opacity-50 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70'
								/>
								<div className='absolute inset-0 bg-gradient-to-r from-transparent to-bg/80 md:to-bg' />
							</div>

							{/* Content */}
							<div className='flex flex-1 flex-col justify-between p-6 md:p-12'>
								<div>
									<div className='mb-4 flex items-start justify-between'>
										<span className='font-mono text-[10px] uppercase tracking-widest text-primary'>
											{project.index}
										</span>
										{project.live ? (
											<span className='font-mono text-[10px] uppercase tracking-widest text-text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
												Live Project
											</span>
										) : null}
									</div>
									<h3 className='mb-3 font-headline text-4xl font-black tracking-tight text-text-base md:text-5xl'>
										{project.title}
									</h3>
									<p className='mb-4 font-mono text-sm uppercase tracking-wider text-primary'>
										{project.tagline}
									</p>
									<p className='max-w-lg font-body leading-relaxed text-text-muted'>
										{project.description}
									</p>
								</div>

								<div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
									<div className='flex flex-wrap gap-2'>
										{project.stack.map(s => (
											<span
												key={s}
												className='bg-surface-high px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted'
											>
												{s}
											</span>
										))}
									</div>
									<div className='flex gap-4'>
										{project.live ? (
											<a
												href={project.live}
												target='_blank'
												rel='noreferrer'
												className='flex items-center gap-1 font-headline text-sm font-bold uppercase tracking-wider text-primary hover:underline'
											>
												Live ↗
											</a>
										) : null}
										{'github' in project ? (
											<a
												href={project.github}
												target='_blank'
												rel='noreferrer'
												className='flex items-center gap-1 font-headline text-sm font-bold uppercase tracking-wider text-text-muted transition-colors hover:text-primary'
											>
												GitHub ↗
											</a>
										) : null}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
