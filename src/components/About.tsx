import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const lines = [
  { label: '2014', text: 'Started in Media Production. Storytelling, visual thinking, editorial instinct.' },
  { label: '2020', text: 'Pivoted hard. MSc Computer Science, University of Birmingham.' },
  { label: '2021', text: 'Joined Government as Junior Engineer. Started shipping.' },
  { label: '2023', text: 'Promoted to Software Engineer. Owning full-stack systems at scale.' },
  { label: 'NOW', text: 'Building observability platforms, migrating monoliths, leading teams.' },
]

export default function About() {
  const linesReference = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const context = gsap.context(() => {
      for (const [index, element] of linesReference.current.entries()) {
        gsap.fromTo(element,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.05,
          }
        )
      }
    })
    return () => context.revert()
  }, [])

  return (
    <section className="relative py-24 md:py-32 px-4 md:px-16 lg:px-24 bg-surface overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-8 mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary mt-1">01 / About</span>
        </div>

        <h2
          className="font-headline font-black text-text-base mb-20 leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(36px, 7vw, 96px)' }}
        >
          A filmmaker<br />
          <span className="text-primary">who learned</span><br />
          to build.
        </h2>

        <div className="space-y-0 border-t border-outline">
          {lines.map((line, index) => (
            <div
              key={line.label}
              ref={element => { if (element) linesReference.current[index] = element }}
              className="group flex items-start gap-8 py-8 border-b border-outline hover:bg-surface-high transition-colors duration-200 px-4 -mx-4"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary min-w-[48px] pt-1">{line.label}</span>
              <p className="font-body text-lg text-text-muted group-hover:text-text-base transition-colors duration-200 leading-relaxed">
                {line.text}
              </p>
              <span className="ml-auto text-text-muted group-hover:text-primary transition-colors duration-200 opacity-0 group-hover:opacity-100 text-xl self-center">→</span>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '3+', label: 'Years at HMG' },
            { value: '5+', label: 'Production Apps' },
            { value: '2', label: 'Degrees' },
            { value: '∞', label: 'Coffees' },
          ].map(stat => (
            <div key={stat.label} className="border-l-2 border-primary pl-4">
              <p className="font-headline font-black text-4xl text-primary">{stat.value}</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
