import ExternalLink from '../../components/ExternalLink'
import { profile } from '../../content'

export default function ContactPostcard() {
	return (
		<article className='postcard' aria-label='Postcard from Manchester'>
			<div className='postcard-message'>
				<p>{profile.contactMessage}</p>
				<p className='postcard-sign'>— Oliver</p>
			</div>
			<div className='postcard-address'>
				<span className='postcard-stamp' aria-hidden='true'>
					MCR
				</span>
				<p>
					<a href={`mailto:${profile.email}`}>{profile.email}</a>
				</p>
				<p>
					<ExternalLink href={profile.links.github}>GitHub</ExternalLink>
				</p>
				{profile.links.linkedin ? (
					<p>
						<ExternalLink href={profile.links.linkedin}>LinkedIn</ExternalLink>
					</p>
				) : null}
				<p>{profile.location}</p>
			</div>
		</article>
	)
}
