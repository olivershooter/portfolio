import { Link } from 'react-router-dom'
import ExternalLink from '../components/ExternalLink'
import SwitchVersionLink from '../components/SwitchVersionLink'
import {
	currentRole,
	experience,
	mobileProjects,
	profile,
	projects,
	skills,
	type Project
} from '../content'

const NAV = [
	{ id: 'about', label: 'About' },
	{ id: 'android', label: 'Android' },
	{ id: 'experience', label: 'Experience' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'skills', label: 'Skills' },
	{ id: 'contact', label: 'Contact' }
] as const

const LINK_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Live site',
	appStore: 'App Store',
	playStore: 'Google Play',
	github: 'GitHub'
}

const YEAR = new Date().getFullYear()

function StackTags({ items }: { readonly items: readonly string[] }) {
	return (
		<ul className='mt-2 flex flex-wrap gap-2' aria-label='Tech stack'>
			{items.map(item => (
				<li
					key={item}
					className='rounded border border-quick-link px-2 text-sm font-semibold text-quick-link'
				>
					{item}
				</li>
			))}
		</ul>
	)
}

function ProjectLinks({ project }: { readonly project: Project }) {
	const entries = Object.entries(project.links) as [
		keyof Project['links'],
		string
	][]
	return (
		<p className='mt-2 flex flex-wrap gap-4'>
			{entries.map(([kind, href]) => (
				<ExternalLink key={kind} href={href} className='quick-link'>
					{`${LINK_LABELS[kind]}: ${project.name}`}
				</ExternalLink>
			))}
		</p>
	)
}

export default function QuickRead() {
	const role = currentRole()
	const [city] = profile.location.split(',')
	return (
		<div className='quick min-h-screen bg-quick-bg font-body text-[17px] leading-relaxed text-quick-text'>
			<header className='border-b-2 border-quick-rule'>
				<a
					href='#main'
					className='sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-10 focus:bg-quick-text focus:px-3 focus:py-2 focus:text-quick-bg'
				>
					Skip to content
				</a>
				<div className='mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-5 py-6'>
					<p className='text-lg font-bold'>{profile.name}</p>
					<nav aria-label='Sections'>
						<ul className='flex flex-wrap gap-x-5 gap-y-2'>
							{NAV.map(item => (
								<li key={item.id}>
									<a
										className='quick-link inline-block py-1'
										href={`#${item.id}`}
									>
										{item.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>

			<main id='main' tabIndex={-1} className='mx-auto max-w-3xl px-5 py-10'>
				<section id='about' aria-labelledby='about-heading'>
					<h1
						id='about-heading'
						className='text-4xl font-extrabold leading-tight'
					>
						{`${profile.title} in ${city}`}
					</h1>
					<p className='mt-4 max-w-prose text-quick-muted'>
						{profile.shortBio}
					</p>
					<ol className='mt-6 space-y-2'>
						{profile.story.map(beat => (
							<li key={beat.year}>
								<span className='font-bold'>{beat.year}</span>
								{` — ${beat.title}. ${beat.text}`}
							</li>
						))}
					</ol>
				</section>

				<section
					id='android'
					aria-labelledby='android-heading'
					className='mt-12'
				>
					<h2 id='android-heading' className='text-2xl font-extrabold'>
						Android
					</h2>
					<p className='mt-2 max-w-prose'>{role.summary}</p>
					<StackTags items={['Kotlin', 'Jetpack Compose']} />
					<ul className='mt-4 space-y-4'>
						{mobileProjects().map(project => (
							<li key={project.id}>
								<h3 className='text-lg font-bold'>{project.name}</h3>
								<p>{project.tagline}</p>
								<ProjectLinks project={project} />
							</li>
						))}
					</ul>
				</section>

				<section
					id='experience'
					aria-labelledby='experience-heading'
					className='mt-12'
				>
					<h2 id='experience-heading' className='text-2xl font-extrabold'>
						Experience
					</h2>
					{experience.map(item => (
						<article key={item.id} className='mt-6'>
							<h3 className='text-lg font-bold'>{item.title}</h3>
							<p className='text-quick-muted'>{`${item.org} · ${item.period}`}</p>
							<ul className='mt-2 list-disc space-y-1 pl-5'>
								{item.bullets.map(bullet => (
									<li key={bullet}>{bullet}</li>
								))}
							</ul>
							<StackTags items={item.stack} />
						</article>
					))}
				</section>

				<section
					id='projects'
					aria-labelledby='projects-heading'
					className='mt-12'
				>
					<h2 id='projects-heading' className='text-2xl font-extrabold'>
						Projects
					</h2>
					{projects.map(project => (
						<article key={project.id} className='mt-8'>
							<h3 className='text-lg font-bold'>{project.name}</h3>
							<p className='font-semibold'>{project.tagline}</p>
							<img
								src={project.image}
								alt={project.alt}
								width={project.imageSize.width}
								height={project.imageSize.height}
								loading='lazy'
								className='mt-3 h-auto w-full rounded'
							/>
							<p className='mt-3'>{project.description}</p>
							<StackTags items={project.stack} />
							<ProjectLinks project={project} />
						</article>
					))}
				</section>

				<section id='skills' aria-labelledby='skills-heading' className='mt-12'>
					<h2 id='skills-heading' className='text-2xl font-extrabold'>
						Skills
					</h2>
					<div className='mt-4 grid gap-6 sm:grid-cols-2'>
						{skills.map(group => (
							<div key={group.title}>
								<h3 className='font-bold'>{group.title}</h3>
								<p>{group.items.join(', ')}</p>
							</div>
						))}
					</div>
				</section>

				<section
					id='contact'
					aria-labelledby='contact-heading'
					className='mt-12'
				>
					<h2 id='contact-heading' className='text-2xl font-extrabold'>
						Contact
					</h2>
					<p className='mt-2 max-w-prose'>{profile.contactMessage}</p>
					<p className='mt-3 flex flex-wrap gap-4'>
						<a className='quick-link' href={`mailto:${profile.email}`}>
							{profile.email}
						</a>
						<ExternalLink className='quick-link' href={profile.links.github}>
							GitHub
						</ExternalLink>
						{profile.links.linkedin ? (
							<ExternalLink
								className='quick-link'
								href={profile.links.linkedin}
							>
								LinkedIn
							</ExternalLink>
						) : null}
					</p>
					<p className='mt-10'>
						Want the interactive version?{' '}
						<Link className='quick-link' to='/late-shift'>
							Visit The Late Shift
						</Link>
					</p>
				</section>
			</main>

			<footer className='border-t-2 border-quick-rule'>
				<div className='mx-auto flex max-w-3xl flex-wrap justify-between gap-4 px-5 py-6 text-quick-muted'>
					<p>{`${profile.name} · ${profile.location} · ${YEAR}`}</p>
					<SwitchVersionLink className='quick-link' />
				</div>
			</footer>
		</div>
	)
}
