import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const links = [
  { label: 'Work', id: 'work' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
]

export default function Nav() {
  const navReference = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(navReference.current,
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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-bg/80 backdrop-blur-xl border-b border-outline"
      >
        <span className="font-headline text-xl font-black text-primary tracking-tighter">OS</span>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {links.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => onScrollToSection(link.id)}
              className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
          <a
            href="mailto:contact@olivershooter.com"
            className="bg-primary text-bg px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest hover:translate-x-1 transition-transform duration-200"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex flex-col gap-[5px] p-1 group"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-text-base transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
          <span className={`block w-6 h-px bg-text-base transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-px bg-text-base transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col items-center gap-10">
          {links.map((link, index) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onScrollToSection(link.id)}
              className="font-headline font-black text-5xl text-text-base hover:text-primary transition-colors duration-200 uppercase tracking-tight"
              style={{ transitionDelay: menuOpen ? `${index * 60}ms` : '0ms' }}
            >
              {link.label}
            </button>
          ))}
          <a
            href="mailto:contact@olivershooter.com"
            onClick={onMenuClose}
            className="mt-4 bg-primary text-bg px-8 py-4 font-headline font-bold text-sm uppercase tracking-widest"
          >
            Hire Me
          </a>
        </div>
        <span className="absolute bottom-12 font-mono text-[11px] uppercase tracking-widest text-text-muted">
          53.4808° N, 2.2426° W
        </span>
      </div>
    </>
  )
}
