import ExternalLink from '../../components/ExternalLink'
import { currentRole, mobileProjects, type Project } from '../../content'

const STORE_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Live site',
	appStore: 'App Store',
	playStore: 'Google Play',
	github: 'GitHub'
}

function Chips({ items }: { readonly items: readonly string[] }) {
	return (
		<ul className='skin-chips' aria-label='Tech stack'>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}

export default function AndroidScreen() {
	const role = currentRole()
	return (
		<div className='phone-screen'>
			<article className='phone-card'>
				<h2>{`${role.org} · ${role.title}`}</h2>
				<p>{role.summary}</p>
				<Chips items={role.stack.slice(0, 2)} />
			</article>
			{mobileProjects().map(project => (
				<article key={project.id} className='phone-card'>
					<h2>{project.name}</h2>
					<p>{project.tagline}</p>
					<Chips items={project.stack} />
					<p className='phone-links'>
						{(
							Object.entries(project.links) as [
								keyof Project['links'],
								string
							][]
						).map(([kind, href]) => (
							<ExternalLink key={kind} href={href}>
								{`${STORE_LABELS[kind]}: ${project.name}`}
							</ExternalLink>
						))}
					</p>
				</article>
			))}
		</div>
	)
}
