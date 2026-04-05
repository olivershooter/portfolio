import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const categories = [
	{
		title: 'Languages',
		items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'HTML/CSS'],
		size: 'col-span-2'
	},
	{
		title: 'Frontend',
		items: ['React', 'Redux', 'TanStack', 'Vite', 'Tailwind CSS'],
		size: 'col-span-1'
	},
	{
		title: 'Backend',
		items: ['Spring Boot', 'FastAPI', 'Django', 'REST APIs', 'MongoDB', 'LDAP'],
		size: 'col-span-1'
	},
	{
		title: 'Cloud & DevOps',
		items: ['Kubernetes', 'Helm', 'Docker', 'OpenShift / OKD', 'AWS', 'CI/CD'],
		size: 'col-span-2'
	},
	{
		title: 'Observability',
		items: ['Grafana', 'Loki', 'Mimir', 'Tempo'],
		size: 'col-span-1'
	},
	{
		title: 'Practice',
		items: [
			'Agile / Scrum',
			'TDD',
			'Pair Programming',
			'Code Review',
			'WCAG 2.1'
		],
		size: 'col-span-1'
	}
]

export default function Skills() {
	const cardsReference = useRef<HTMLDivElement[]>([])

	useEffect(() => {
		const context = gsap.context(() => {
			gsap.fromTo(
				cardsReference.current,
				{ opacity: 0, y: 40 },
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					stagger: 0.08,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: cardsReference.current[0],
						start: 'top 80%',
						toggleActions: 'play none none none'
					}
				}
			)
		})
		return () => context.revert()
	}, [])

	return (
		<section
			id='skills'
			className='bg-bg px-4 py-24 md:px-16 md:py-32 lg:px-24'
		>
			<div className='mx-auto max-w-6xl'>
				<span className='mb-4 block font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
					04 / Skills
				</span>
				<h2
					className='mb-16 font-headline font-black leading-[0.9] tracking-tight text-text-base'
					style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
				>
					The stack.
					<br />
					<span className='text-primary'>No fluff.</span>
				</h2>

				<div className='grid grid-cols-2 gap-px bg-outline md:grid-cols-4'>
					{categories.map((cat, index) => (
						<div
							key={cat.title}
							ref={element => {
								if (element) cardsReference.current[index] = element
							}}
							className={`group bg-surface p-5 transition-colors duration-200 hover:bg-surface-high md:p-8 ${cat.size}`}
						>
							<h3 className='mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-primary'>
								{cat.title}
							</h3>
							<ul className='space-y-2'>
								{cat.items.map(item => (
									<li
										key={item}
										className='flex items-center gap-3 font-body text-text-muted transition-colors duration-200 group-hover:text-text-base'
									>
										<span className='h-1 w-1 flex-shrink-0 bg-primary' />
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
