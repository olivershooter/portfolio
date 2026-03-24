import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const categories = [
  {
    title: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'HTML/CSS'],
    size: 'col-span-2',
  },
  {
    title: 'Frontend',
    items: ['React', 'Redux', 'TanStack', 'Vite', 'Tailwind CSS'],
    size: 'col-span-1',
  },
  {
    title: 'Backend',
    items: ['Spring Boot', 'FastAPI', 'Django', 'REST APIs', 'MongoDB', 'LDAP'],
    size: 'col-span-1',
  },
  {
    title: 'Cloud & DevOps',
    items: ['Kubernetes', 'Helm', 'Docker', 'OpenShift / OKD', 'AWS', 'CI/CD'],
    size: 'col-span-2',
  },
  {
    title: 'Observability',
    items: ['Grafana', 'Loki', 'Mimir', 'Tempo'],
    size: 'col-span-1',
  },
  {
    title: 'Practice',
    items: ['Agile / Scrum', 'TDD', 'Pair Programming', 'Code Review', 'WCAG 2.1'],
    size: 'col-span-1',
  },
]

export default function Skills() {
  const cardsReference = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(cardsReference.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsReference.current[0],
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
    return () => context.revert()
  }, [])

  return (
    <section id="skills" className="py-24 md:py-32 px-4 md:px-16 lg:px-24 bg-bg">
      <div className="max-w-6xl mx-auto">
        <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary block mb-4">04 / Skills</span>
        <h2
          className="font-headline font-black text-text-base leading-[0.9] tracking-tight mb-16"
          style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}
        >
          The stack.<br />
          <span className="text-primary">No fluff.</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline">
          {categories.map((cat, index) => (
            <div
              key={cat.title}
              ref={element => { if (element) cardsReference.current[index] = element }}
              className={`bg-surface p-5 md:p-8 group hover:bg-surface-high transition-colors duration-200 ${cat.size}`}
            >
              <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary mb-6">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.items.map(item => (
                  <li key={item} className="flex items-center gap-3 font-body text-text-muted group-hover:text-text-base transition-colors duration-200">
                    <span className="w-1 h-1 bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
