import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const lines = [
	{
		label: '2014',
		text: 'Started in Media Production. Learned to tell stories and think visually.'
	},
	{
		label: '2020',
		text: 'Pivoted hard. MSc Computer Science, University of Birmingham.'
	},
	{
		label: '2021',
		text: 'Joined Government as Junior Engineer. Started shipping.'
	},
	{
		label: '2023',
		text: 'Promoted to Software Engineer. Owned full-stack systems, ran a team.'
	},
	{
		label: 'NOW',
		text: 'At Deloitte now. Consulting pace, different problems every few months.'
	}
]

export default function About() {
	const linesReference = useRef<HTMLDivElement[]>([])

	useEffect(() => {
		const context = gsap.context(() => {
			for (const [index, element] of linesReference.current.entries()) {
				gsap.fromTo(
					element,
					{ opacity: 0, x: -40 },
					{
						opacity: 1,
						x: 0,
						duration: 0.5,
						ease: 'power3.out',
						scrollTrigger: {
							trigger: element,
							start: 'top 80%',
							toggleActions: 'play none none none'
						},
						delay: index * 0.05
					}
				)
			}
		})
		return () => context.revert()
	}, [])

	return (
		<section className='relative overflow-hidden bg-surface px-4 py-24 md:px-16 md:py-32 lg:px-24'>
			<div className='mx-auto max-w-5xl'>
				<div className='mb-16 flex items-start gap-8'>
					<span className='mt-1 font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
						01 / About
					</span>
				</div>

				<h2
					className='mb-20 font-headline font-black leading-[0.9] tracking-tight text-text-base'
					style={{ fontSize: 'clamp(36px, 7vw, 96px)' }}
				>
					A filmmaker
					<br />
					<span className='text-primary'>who learned</span>
					<br />
					to build.
				</h2>

				<div className='space-y-0 border-t border-outline'>
					{lines.map((line, index) => (
						<div
							key={line.label}
							ref={element => {
								if (element) linesReference.current[index] = element
							}}
							className='group -mx-4 flex items-start gap-8 border-b border-outline px-4 py-8 transition-colors duration-200 hover:bg-surface-high'
						>
							<span className='min-w-[48px] pt-1 font-mono text-[11px] uppercase tracking-widest text-primary'>
								{line.label}
							</span>
							<p className='font-body text-lg leading-relaxed text-text-muted transition-colors duration-200 group-hover:text-text-base'>
								{line.text}
							</p>
							<span className='ml-auto self-center text-xl text-text-muted opacity-0 transition-colors duration-200 group-hover:text-primary group-hover:opacity-100'>
								→
							</span>
						</div>
					))}
				</div>

				<div className='mt-20 grid grid-cols-2 gap-8 md:grid-cols-4'>
					{[
						{ value: '3+', label: 'Years at HMG' },
						{ value: '5+', label: 'Production Apps' },
						{ value: '2', label: 'Degrees' },
						{ value: '∞', label: 'Coffees' }
					].map(stat => (
						<div key={stat.label} className='border-l-2 border-primary pl-4'>
							<p className='font-headline text-4xl font-black text-primary'>
								{stat.value}
							</p>
							<p className='mt-1 font-mono text-[11px] uppercase tracking-widest text-text-muted'>
								{stat.label}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
