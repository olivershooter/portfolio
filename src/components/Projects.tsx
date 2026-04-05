import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const projects = [
  {
    index: '01',
    title: 'Football Statistics',
    tagline: 'Full-stack sports analytics. No sign-ups, no paywalls.',
    description: 'Built a complete sports analytics platform delivering historical match results, live statistics, timelines, and highlights — entirely free. React/TypeScript frontend powered by a Python/FastAPI backend with third-party API integrations.',
    stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python'],
    live: 'https://football.olivershooter.com',
    image: '/images/football.png',
    accent: 'border-primary',
  },
  {
    index: '02',
    title: 'Salah Times',
    tagline: 'Prayer times app. Beautiful, accurate, offline-ready.',
    description: 'A React Native mobile app delivering accurate prayer times with dynamic sky backgrounds that shift from dawn to night. Auto-selects the most authoritative calculation source for your country (JAKIM, Kemenag, Al-Adhan). Push notifications, countdown timers, and full offline support.',
    stack: ['React Native', 'Expo', 'TypeScript'],
    live: 'https://apps.apple.com/gb/app/simple-salah-times/id6760982824',
    image: '/images/salah.png',
    accent: 'border-surface-highest',
  },
  {
    index: '03',
    title: 'Screendle',
    tagline: 'Daily movie guessing game. Five clues. Five guesses.',
    description: 'A Wordle-style game where players identify a film from progressively revealed clues — plot synopsis, release date, runtime, box office, and actors. Full-stack with server-side answer validation, weekly batch game generation, and holiday theming.',
    stack: ['React', 'TypeScript', 'Vite', 'Express', 'PostgreSQL'],
    live: 'https://screendle.com',
    image: '/images/screendle.png',
    accent: 'border-surface-highest',
  },
  {
    index: '04',
    title: 'Candice',
    tagline: 'Language translation on Android. Works offline.',
    description: 'A Java Android application using Google ML Kit for real-time text, speech, and image translation. Features translation history, a flashcard game, and downloadable language models for offline use. Full CRUD with local NoSQL storage.',
    stack: ['Java', 'Android', 'Google ML Kit', 'NoSQL'],
    github: 'https://github.com/olivershooter/candice',
    image: '/images/candice.png',
    accent: 'border-surface-highest',
  },
]

export default function Projects() {
  const cardsReference = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const context = gsap.context(() => {
      for (const card of cardsReference.current) {
        gsap.fromTo(card,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    })
    return () => context.revert()
  }, [])

  return (
    <section id="projects" className="py-24 md:py-32 px-4 md:px-16 lg:px-24 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-20">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary block mb-4">03 / Projects</span>
            <h2
              className="font-headline font-black text-text-base leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
            >
              Shipped.<br />
              <span className="text-primary">In the wild.</span>
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={project.index}
              ref={element => { if (element) cardsReference.current[index] = element }}
              className={`group relative overflow-hidden bg-bg border-l-4 ${project.accent} hover:border-primary transition-all duration-500 flex flex-col md:flex-row`}
            >
              {/* Image */}
              <div className="relative md:w-[45%] h-64 md:h-auto overflow-hidden flex-shrink-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg/80 md:to-bg" />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between p-6 md:p-12 flex-1">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{project.index}</span>
                    {project.live ? (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300">Live Project</span>
                    ) : null}
                  </div>
                  <h3 className="font-headline font-black text-4xl md:text-5xl text-text-base mb-3 tracking-tight">{project.title}</h3>
                  <p className="font-mono text-sm text-primary mb-4 uppercase tracking-wider">{project.tagline}</p>
                  <p className="font-body text-text-muted leading-relaxed max-w-lg">{project.description}</p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map(s => (
                      <span key={s} className="font-mono text-[10px] uppercase tracking-wider text-text-muted bg-surface-high px-3 py-1.5">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.live ? (
                      <a href={project.live} target="_blank" rel="noreferrer"
                        className="font-headline font-bold text-sm uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                        Live ↗
                      </a>
                    ) : null}
                    {'github' in project ? (
                      <a href={project.github} target="_blank" rel="noreferrer"
                        className="font-headline font-bold text-sm uppercase tracking-wider text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                        GitHub ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
