import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const roles = [
  {
    title: 'Junior Software Engineer',
    org: "Government",
    period: 'Oct 2022 – Jun 2023',
    bullets: [
      'Migrated Create React App → Vite, slashing build times and improving security posture.',
      'Translated design mockups into production-ready React/TypeScript components.',
      'Collaborated on Spring Boot backends: API integrations and data handling.',
      'Pair programming, code reviews, and refinement sessions across the team.',
    ],
    stack: ['React', 'TypeScript', 'Java', 'Spring Boot', 'AWS'],
  },
  {
    title: 'Software Engineer',
    org: "Government",
    period: 'Jun 2023 – Present',
    bullets: [
      'Delivered a full-stack onboarding application (React + Spring Boot + OpenShift). Now a core training tool for all employees.',
      'Migrated a static HTML prototype to React/Vite + FastAPI + MongoDB with WCAG 2.1 compliance. Used by all project customers.',
      'Designing middleware to automate manual workflows — bridging two core services, persisting to MongoDB, deploying on OKD.',
      'Led modernisation of a monolithic monitoring stack into microservices using Helm, Kubernetes, Grafana, Loki, Mimir, and Tempo.',
    ],
    stack: ['React', 'FastAPI', 'Spring Boot', 'MongoDB', 'Kubernetes', 'Helm', 'Grafana', 'OpenShift'],
  },
]

function RoleCard({
  role,
  index,
  className = 'flex-shrink-0 w-[min(560px,88vw)] h-[70vh] p-10 mr-6 flex flex-col justify-between',
  hasIndex = true,
}: {
  role: typeof roles[0]
  index: number
  className?: string
  hasIndex?: boolean
}) {
  return (
    <div className={`bg-surface border border-outline hover:border-primary transition-colors duration-300 group ${className}`}>
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary block mb-2">{role.period}</span>
            <h3 className="font-headline font-black text-2xl text-text-base">{role.title}</h3>
            <p className="font-mono text-sm text-text-muted mt-1">{role.org}</p>
          </div>
          {hasIndex ? (
            <span className="text-2xl text-outline group-hover:text-primary transition-colors duration-300 mt-1">0{index + 1}</span>
          ) : null}
        </div>

        <ul className="space-y-3">
          {role.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-text-muted leading-relaxed">
              <span className="text-primary mt-1 flex-shrink-0">—</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {role.stack.map(s => (
          <span key={s} className="font-mono text-[10px] uppercase tracking-wider text-text-muted bg-surface-high px-3 py-1.5">
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
        anticipatePin: 1,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section ref={sectionReference} id="work" className="bg-bg">
      {/* Desktop: horizontal scroll */}
      <div ref={trackReference} className="hidden md:flex h-screen items-center gap-0 pl-8 md:pl-16 lg:pl-24 overflow-hidden">
        {/* Section header card */}
        <div className="flex-shrink-0 w-[min(400px,85vw)] h-[70vh] flex flex-col justify-between border-r border-outline pr-16 mr-16">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary block mb-6">02 / Experience</span>
            <h2
              className="font-headline font-black text-text-base leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
            >
              Building<br />
              things<br />
              <span className="text-primary">that matter.</span>
            </h2>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted flex items-center gap-3">
            <span className="w-6 h-px bg-outline" />
            Scroll to explore
          </div>
        </div>

        {roles.map((role, index) => (
          <RoleCard key={role.title} role={role} index={index} />
        ))}

        <div className="flex-shrink-0 w-24" />
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden px-8 py-24">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary block mb-6">02 / Experience</span>
        <h2
          className="font-headline font-black text-text-base leading-[0.9] tracking-tight mb-16"
          style={{ fontSize: 'clamp(40px, 10vw, 64px)' }}
        >
          Building<br />
          things<br />
          <span className="text-primary">that matter.</span>
        </h2>

        <div className="space-y-6">
          {roles.map((role, index) => (
            <RoleCard
              key={role.title}
              role={role}
              index={index}
              hasIndex={false}
              className="p-8 flex flex-col gap-6"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
