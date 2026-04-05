import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
	const tagReference = useRef<HTMLSpanElement>(null)
	const h1Reference = useRef<HTMLHeadingElement>(null)
	const subReference = useRef<HTMLParagraphElement>(null)
	const ctaReference = useRef<HTMLDivElement>(null)
	const imgReference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const tl = gsap.timeline({ delay: 0.6 })
		tl.fromTo(
			tagReference.current,
			{ opacity: 0, x: -20 },
			{ opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
		)
			.fromTo(
				[...(h1Reference.current?.children ?? [])],
				{ opacity: 0, y: 60, skewY: 3 },
				{
					opacity: 1,
					y: 0,
					skewY: 0,
					duration: 0.9,
					stagger: 0.12,
					ease: 'power3.out'
				},
				'-=0.2'
			)
			.fromTo(
				subReference.current,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
				'-=0.4'
			)
			.fromTo(
				ctaReference.current,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
				'-=0.4'
			)
			.fromTo(
				imgReference.current,
				{ opacity: 0, x: 40 },
				{ opacity: 1, x: 0, duration: 1, ease: 'power3.out' },
				'-=0.8'
			)
	}, [])

	const onViewWork = () => {
		document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<section className='relative flex min-h-screen flex-col overflow-hidden pt-20 md:flex-row'>
			<div className='relative z-10 flex flex-1 flex-col justify-center px-8 py-24 md:px-16 lg:px-24'>
				<span
					ref={tagReference}
					className='mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-text-muted'
				>
					<span className='h-px w-10 bg-primary' />
					Manchester Based · Available for Developer Roles
				</span>

				<h1
					ref={h1Reference}
					className='mb-8 font-headline font-black leading-[0.88] tracking-[-3px] text-text-base'
					style={{ fontSize: 'clamp(44px, 9vw, 120px)' }}
				>
					<span className='block'>Software</span>
					<span className='block text-primary'>Engineer.</span>
				</h1>

				<p
					ref={subReference}
					className='mb-12 max-w-md font-body text-lg leading-relaxed text-text-muted'
				>
					Started in film, ended up in engineering. I build full-stack
					applications for Government, consulting, and myself.
				</p>

				<div ref={ctaReference} className='flex flex-wrap gap-4'>
					<button
						type='button'
						onClick={onViewWork}
						className='bg-primary px-10 py-4 font-headline text-sm font-bold uppercase tracking-widest text-bg transition-transform duration-200 hover:translate-x-1.5'
					>
						View Work
					</button>
					<a
						href='https://github.com/olivershooter'
						target='_blank'
						rel='noreferrer'
						className='flex items-center gap-2 border border-outline px-10 py-4 font-headline text-sm font-bold uppercase tracking-widest text-text-base transition-colors duration-200 hover:border-primary hover:text-primary'
					>
						GitHub <span>↗</span>
					</a>
				</div>

				<div className='absolute left-0 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 pl-4 lg:flex'>
					<div className='h-24 w-px bg-gradient-to-b from-transparent via-outline to-transparent' />
					<span className='rotate-90 whitespace-nowrap font-mono text-[10px] tracking-[0.4em] text-text-muted'>
						2026
					</span>
					<div className='h-24 w-px bg-gradient-to-b from-transparent via-outline to-transparent' />
				</div>
			</div>

			<div
				ref={imgReference}
				className='relative min-h-[50vh] flex-1 overflow-hidden bg-surface md:min-h-screen'
			>
				<img
					src='/images/hero.png'
					alt='Abstract circuit board'
					className='h-full w-full object-cover opacity-60 mix-blend-luminosity'
				/>
				<div className='absolute inset-0 bg-gradient-to-r from-bg via-transparent to-transparent' />
				<div className='absolute bottom-4 right-4 border-l-4 border-primary bg-surface-high px-4 py-3 md:bottom-8 md:right-8 md:px-6 md:py-4'>
					<p className='mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted'>
						Status
					</p>
					<p className='font-mono text-sm font-medium text-text-base'>
						Ready for Deployment
					</p>
				</div>
				<div className='absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce flex-col items-center gap-2 md:flex'>
					<span className='font-mono text-[10px] uppercase tracking-widest text-text-muted'>
						Scroll
					</span>
					<span className='text-lg text-text-muted'>↓</span>
				</div>
			</div>
		</section>
	)
}
