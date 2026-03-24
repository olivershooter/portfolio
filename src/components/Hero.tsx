import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const tagRef = useRef<HTMLSpanElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.6 })
    tl.fromTo(tagRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(Array.from(h1Ref.current?.children ?? []), { opacity: 0, y: 60, skewY: 3 }, { opacity: 1, y: 0, skewY: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, '-=0.2')
      .fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(imgRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col md:flex-row pt-20 overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24">
        <span ref={tagRef} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-text-muted mb-8">
          <span className="w-10 h-px bg-primary" />
          London Based · Available for Senior Roles
        </span>

        <h1 ref={h1Ref} className="font-headline font-black leading-[0.88] tracking-[-3px] text-text-base mb-8" style={{ fontSize: 'clamp(64px, 9vw, 120px)' }}>
          <span className="block">Software</span>
          <span className="block text-primary">Engineer.</span>
        </h1>

        <p ref={subRef} className="font-body text-lg text-text-muted max-w-md leading-relaxed mb-12">
          From storyteller to system builder. I design and ship full-stack
          applications that scale — from HM Government infrastructure to
          open-source tooling.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-4">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary text-bg px-10 py-4 font-headline font-bold text-sm uppercase tracking-widest hover:translate-x-1.5 transition-transform duration-200"
          >
            View Work
          </button>
          <a
            href="https://github.com/olivershooter"
            target="_blank"
            rel="noreferrer"
            className="border border-outline text-text-base px-10 py-4 font-headline font-bold text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors duration-200 flex items-center gap-2"
          >
            GitHub <span>↗</span>
          </a>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 pl-4">
          <div className="h-24 w-px bg-gradient-to-b from-transparent via-outline to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-text-muted rotate-90 whitespace-nowrap">2026</span>
          <div className="h-24 w-px bg-gradient-to-b from-transparent via-outline to-transparent" />
        </div>
      </div>

      <div ref={imgRef} className="relative flex-1 min-h-[50vh] md:min-h-screen overflow-hidden bg-surface">
        <img
          src="/images/hero.png"
          alt="Abstract circuit board"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-transparent" />
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-surface-high border-l-4 border-primary px-4 py-3 md:px-6 md:py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted mb-1">Status</p>
          <p className="font-mono text-sm text-text-base font-medium">Ready for Deployment</p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-bounce">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Scroll</span>
          <span className="text-text-muted text-lg">↓</span>
        </div>
      </div>
    </section>
  )
}
