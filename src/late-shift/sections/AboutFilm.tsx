/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the film strip scrolls horizontally, so it must be keyboard-focusable (WCAG 2.1.1, axe scrollable-region-focusable) */
import { profile } from '../../content'

export default function AboutFilm() {
	return (
		<>
			<p className='skin-lede'>{profile.shortBio}</p>
			<section
				className='film-strip'
				tabIndex={0}
				aria-label='My story, as film frames'
			>
				<ol>
					{profile.story.map((beat, index) => (
						<li key={beat.year} className='film-frame'>
							<span className='film-frame-number'>{`FRAME ${String(index + 1).padStart(2, '0')}`}</span>
							<span className='film-frame-year'>{beat.year}</span>
							<h2 className='film-frame-title'>{beat.title}</h2>
							<p>{beat.text}</p>
						</li>
					))}
				</ol>
			</section>
		</>
	)
}
