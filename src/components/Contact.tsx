import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

const YEAR = new Date().getFullYear()

export default function Contact() {
	const headReference = useRef<HTMLHeadingElement>(null)

	useEffect(() => {
		const context = gsap.context(() => {
			gsap.fromTo(
				headReference.current,
				{ opacity: 0, y: 60 },
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: headReference.current,
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
			id='contact'
			className='relative overflow-hidden bg-surface px-4 py-24 md:px-16 md:py-40 lg:px-24'
		>
			{/* Big background text */}
			<div className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden'>
				<span
					className='select-none whitespace-nowrap font-headline font-black text-surface-high'
					style={{ fontSize: 'clamp(80px, 18vw, 240px)' }}
				>
					CONTACT
				</span>
			</div>

			<div className='relative z-10 mx-auto max-w-4xl text-center'>
				<span className='mb-6 block font-mono text-[11px] uppercase tracking-[0.35em] text-primary'>
					05 / Contact
				</span>

				<h2
					ref={headReference}
					className='mb-8 font-headline font-black leading-[0.9] tracking-tight text-text-base'
					style={{ fontSize: 'clamp(36px, 7vw, 96px)' }}
				>
					Let&apos;s build
					<br />
					<span className='text-primary'>something real.</span>
				</h2>

				<p className='mx-auto mb-12 max-w-xl font-body text-lg leading-relaxed text-text-muted'>
					Looking for engineering roles where the problems are hard and the
					team gives a damn. If that sounds like yours, I&apos;d like to hear
					about it.
				</p>

				<div className='flex flex-wrap items-center justify-center gap-4'>
					<a
						href='mailto:contact@olivershooter.com'
						className='bg-primary px-6 py-4 font-headline text-xs font-bold uppercase tracking-widest text-bg transition-transform duration-200 hover:translate-x-1.5 md:px-10 md:text-sm'
					>
						contact@olivershooter.com
					</a>
					<a
						href='https://github.com/olivershooter'
						target='_blank'
						rel='noreferrer'
						className='border border-outline px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest text-text-muted transition-colors duration-200 hover:border-primary hover:text-primary'
					>
						GitHub ↗
					</a>
				</div>
			</div>

			{/* Footer */}
			<div className='relative z-10 mt-32 flex flex-col items-center justify-between gap-4 border-t border-outline pt-8 md:flex-row'>
				<span className='font-headline text-xl font-black tracking-tighter text-primary'>
					OS
				</span>
				<span className='font-mono text-[11px] uppercase tracking-widest text-text-muted'>
					Oliver Shooter · Manchester, UK · {YEAR}
				</span>
				<div className='flex gap-6'>
					{[
						['olivershooter.com', 'https://olivershooter.com'],
						['GitHub', 'https://github.com/olivershooter']
					].map(([label, href]) => (
						<a
							key={label}
							href={href}
							target='_blank'
							rel='noreferrer'
							className='font-mono text-[11px] uppercase tracking-wider text-text-muted transition-colors hover:text-primary'
						>
							{label}
						</a>
					))}
				</div>
			</div>
		</section>
	)
}
