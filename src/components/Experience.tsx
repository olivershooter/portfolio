import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const roles = [
	{
		title: 'Junior Software Engineer',
		org: 'Government',
		period: 'Oct 2022 – Jun 2023',
		bullets: [
			'Migrated Create React App to Vite. Build times dropped, dependency vulnerabilities went with them.',
			'Turned Figma mockups into React/TypeScript components that actually shipped.',
			'Worked on Spring Boot backends: API integrations and data persistence.',
			'Lots of pair programming, code reviews, and sprint refinements.'
		],
		stack: ['React', 'TypeScript', 'Java', 'Spring Boot', 'AWS']
	},
	{
		title: 'Software Engineer',
		org: 'Government',
		period: 'Jun 2023 – Feb 2026',
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
		]
	},
	{
		title: 'Senior Consultant · Software Engineer',
		org: 'Deloitte',
		period: 'Feb 2026 – Present',
		bullets: [
			'Sit inside client delivery teams. Build the frontend, ship it, move on to the next one.',
			'Writing React apps that need to be fast and accessible. Turning messy requirements into components that make sense.',
			'Working across design, product, and backend to keep the frontend consistent across projects.',
			'Have a say in technical direction. Mentor other engineers when I can.'
		],
		stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS']
	}
]

function RoleCard({
	role,
	index,
	className = 'flex-shrink-0 w-[min(560px,88vw)] h-[70vh] p-10 mr-6 flex flex-col justify-between',
	hasIndex = true
}: {
	role: (typeof roles)[0]
	index: number
	className?: string
	hasIndex?: boolean
}) {
	return (
		<div
			className={`group border border-outline bg-surface transition-colors duration-300 hover:border-primary ${className}`}
		>
			<div>
				<div className='mb-6 flex items-start justify-between'>
					<div>
						<span className='mb-2 block font-mono text-[10px] uppercase tracking-widest text-primary'>
							{role.period}
						</span>
						<h3 className='font-headline text-2xl font-black text-text-base'>
							{role.title}
						</h3>
						<p className='mt-1 font-mono text-sm text-text-muted'>{role.org}</p>
					</div>
					{hasIndex ? (
						<span className='mt-1 text-2xl text-outline transition-colors duration-300 group-hover:text-primary'>
							0{index + 1}
						</span>
					) : null}
				</div>

				<ul className='space-y-3'>
					{role.bullets.map(b => (
						<li
							key={b}
							className='flex items-start gap-3 text-sm leading-relaxed text-text-muted'
						>
							<span className='mt-1 flex-shrink-0 text-primary'>—</span>
							<span>{b}</span>
						</li>
					))}
				</ul>
			</div>

			<div className='mt-6 flex flex-wrap gap-2'>
				{role.stack.map(s => (
					<span
						key={s}
						className='bg-surface-high px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted'
					>
						{s}
					</span>
				))}
			</div>
		</div>
	)
}

export default function Experience() {
	const sectionReference = useRef<HTMLDivElement>(null)
	const trackReference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const track = trackReference.current
		const section = sectionReference.current
		if (!track || !section || window.innerWidth < 768) return undefined

		const totalWidth = track.scrollWidth - section.offsetWidth

		const tween = gsap.to(track, {
			x: -totalWidth,
			ease: 'none',
			scrollTrigger: {
				trigger: section,
				start: 'top top',
				end: () => `+=${totalWidth + 300}`,
				pin: true,
				scrub: 1,
				anticipatePin: 1
			}
		})

		return () => {
			tween.scrollTrigger?.kill()
			tween.kill()
		}
	}, [])

	return (
		<section ref={sectionReference} id='work' className='bg-bg'>
			{/* Desktop: horizontal scroll */}
			<div
				ref={trackReference}
				className='hidden h-screen items-center gap-0 overflow-hidden pl-8 md:flex md:pl-16 lg:pl-24'
			>
				{/* Section header card */}
				<div className='mr-16 flex h-[70vh] w-[min(400px,85vw)] flex-shrink-0 flex-col justify-between border-r border-outline pr-16'>
					<div>
						<span className='mb-6 block font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
							02 / Experience
						</span>
						<h2
							className='font-headline font-black leading-[0.9] tracking-tight text-text-base'
							style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
						>
							Building
							<br />
							things
							<br />
							<span className='text-primary'>that matter.</span>
						</h2>
					</div>
					<div className='flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-text-muted'>
						<span className='h-px w-6 bg-outline' />
						Scroll to explore
					</div>
				</div>

				{roles.map((role, index) => (
					<RoleCard key={role.title} role={role} index={index} />
				))}

				<div className='w-24 flex-shrink-0' />
			</div>

			{/* Mobile: vertical stack */}
			<div className='px-8 py-24 md:hidden'>
				<span className='mb-6 block font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
					02 / Experience
				</span>
				<h2
					className='mb-16 font-headline font-black leading-[0.9] tracking-tight text-text-base'
					style={{ fontSize: 'clamp(40px, 10vw, 64px)' }}
				>
					Building
					<br />
					things
					<br />
					<span className='text-primary'>that matter.</span>
				</h2>

				<div className='space-y-6'>
					{roles.map((role, index) => (
						<RoleCard
							key={role.title}
							role={role}
							index={index}
							hasIndex={false}
							className='flex flex-col gap-6 p-8'
						/>
					))}
				</div>
			</div>
		</section>
	)
}
