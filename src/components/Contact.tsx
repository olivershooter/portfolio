import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const YEAR = new Date().getFullYear()

export default function Contact() {
  const headReference = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(headReference.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headReference.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
    return () => context.revert()
  }, [])

  return (
    <section id="contact" className="relative py-24 md:py-40 px-4 md:px-16 lg:px-24 bg-surface overflow-hidden">
      {/* Big background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-headline font-black text-surface-high whitespace-nowrap select-none"
          style={{ fontSize: 'clamp(80px, 18vw, 240px)' }}
        >
          CONTACT
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary block mb-6">05 / Contact</span>

        <h2
          ref={headReference}
          className="font-headline font-black text-text-base leading-[0.9] tracking-tight mb-8"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}
        >
          Let&apos;s build<br />
          <span className="text-primary">something real.</span>
        </h2>

        <p className="font-body text-lg text-text-muted max-w-xl mx-auto leading-relaxed mb-12">
          I&apos;m interested in senior engineering roles, technically challenging problems,
          and teams that care about craft. If that sounds like you — let&apos;s talk.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:olivershooter@gmail.com"
            className="bg-primary text-bg px-6 md:px-10 py-4 font-headline font-bold text-xs md:text-sm uppercase tracking-widest hover:translate-x-1.5 transition-transform duration-200"
          >
            olivershooter@gmail.com
          </a>
          <a
            href="https://github.com/olivershooter"
            target="_blank"
            rel="noreferrer"
            className="border border-outline text-text-muted px-8 py-4 font-headline font-bold text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-colors duration-200"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-32 pt-8 border-t border-outline flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-headline font-black text-xl text-primary tracking-tighter">OS</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
          Oliver Shooter · London, UK · {YEAR}
        </span>
        <div className="flex gap-6">
          {[
            ['olivershooter.com', 'https://olivershooter.com'],
            ['GitHub', 'https://github.com/olivershooter'],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
              className="font-mono text-[11px] uppercase tracking-wider text-text-muted hover:text-primary transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
