import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const links = [
	{ label: 'Work', id: 'work' },
	{ label: 'Projects', id: 'projects' },
	{ label: 'Skills', id: 'skills' },
	{ label: 'Contact', id: 'contact' }
]

export default function Nav() {
	const navReference = useRef<HTMLElement>(null)
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		gsap.fromTo(
			navReference.current,
			{ y: -80, opacity: 0 },
			{ y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
		)
	}, [])

	const onScrollToSection = (id: string) => {
		document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' })
		setMenuOpen(false)
	}

	const onMenuToggle = () => setMenuOpen(open => !open)
	const onMenuClose = () => setMenuOpen(false)

	return (
		<>
			<nav
				ref={navReference}
				className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-outline bg-bg/80 px-8 py-5 backdrop-blur-xl'
			>
				<span className='font-headline text-xl font-black tracking-tighter text-primary'>
					OS
				</span>

				{/* Desktop nav */}
				<div className='hidden items-center gap-10 md:flex'>
					{links.map(link => (
						<button
							key={link.id}
							type='button'
							onClick={() => onScrollToSection(link.id)}
							className='font-mono text-xs uppercase tracking-[0.2em] text-text-muted transition-colors duration-200 hover:text-primary'
						>
							{link.label}
						</button>
					))}
					<a
						href='mailto:contact@olivershooter.com'
						className='bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-bg transition-transform duration-200 hover:translate-x-1'
					>
						Hire Me
					</a>
				</div>

				{/* Mobile hamburger */}
				<button
					type='button'
					className='group flex flex-col gap-[5px] p-1 md:hidden'
					onClick={onMenuToggle}
					aria-label='Toggle menu'
				>
					<span
						className={`block h-px w-6 bg-text-base transition-all duration-300 ${menuOpen ? 'translate-y-[9px] rotate-45' : ''}`}
					/>
					<span
						className={`block h-px w-6 bg-text-base transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
					/>
					<span
						className={`block h-px w-6 bg-text-base transition-all duration-300 ${menuOpen ? '-translate-y-[9px] -rotate-45' : ''}`}
					/>
				</button>
			</nav>

			{/* Mobile menu overlay */}
			<div
				className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-xl transition-all duration-500 md:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
			>
				<div className='flex flex-col items-center gap-10'>
					{links.map((link, index) => (
						<button
							key={link.id}
							type='button'
							onClick={() => onScrollToSection(link.id)}
							className='font-headline text-5xl font-black uppercase tracking-tight text-text-base transition-colors duration-200 hover:text-primary'
							style={{ transitionDelay: menuOpen ? `${index * 60}ms` : '0ms' }}
						>
							{link.label}
						</button>
					))}
					<a
						href='mailto:contact@olivershooter.com'
						onClick={onMenuClose}
						className='mt-4 bg-primary px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest text-bg'
					>
						Hire Me
					</a>
				</div>
				<span className='absolute bottom-12 font-mono text-[11px] uppercase tracking-widest text-text-muted'>
					53.4808° N, 2.2426° W
				</span>
			</div>
		</>
	)
}
