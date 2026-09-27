import ExternalLink from '../../components/ExternalLink'
import { getProject, type Project, type ProjectId } from '../../content'

const LINK_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Visit the live site',
	appStore: 'Get it on the App Store',
	playStore: 'Get it on Google Play',
	github: 'Read the code on GitHub'
}

export default function ProjectZine({
	projectId
}: {
	readonly projectId: ProjectId
}) {
	const project = getProject(projectId)
	return (
		<div className='zine'>
			<p className='zine-tagline'>{project.tagline}</p>
			<figure className='zine-figure'>
				<img
					src={project.image}
					alt={project.alt}
					width={project.imageSize.width}
					height={project.imageSize.height}
					loading='lazy'
				/>
			</figure>
			<p>{project.description}</p>
			<ul className='skin-chips' aria-label='Tech stack'>
				{project.stack.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p className='zine-links'>
				{(
					Object.entries(project.links) as [keyof Project['links'], string][]
				).map(([kind, href]) => (
					<ExternalLink key={kind} href={href}>
						{LINK_LABELS[kind]}
					</ExternalLink>
				))}
			</p>
		</div>
	)
}
