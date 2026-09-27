import { useMemo, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { profile } from '../content'
import { track } from '../lib/analytics'
import {
	landingRedirect,
	rememberVersion,
	type Version
} from '../lib/versionChoice'

export default function Landing() {
	const location = useLocation()
	// Idempotent: forgetting an already-forgotten choice is harmless on re-render
	const redirect = useMemo(
		() => landingRedirect(location.search),
		[location.search]
	)
	const [isRemembering, setIsRemembering] = useState(false)

	if (redirect) return <Navigate to={redirect} replace />

	const onChoose = (version: Version) => {
		if (isRemembering) rememberVersion(version)
		track('version-chosen', { version })
	}
	const onChooseLateShift = () => onChoose('late-shift')
	const onChooseQuick = () => onChoose('quick')
	const onRememberChange = (event: ChangeEvent<HTMLInputElement>) =>
		setIsRemembering(event.target.checked)
	const [city] = profile.location.split(',')

	return (
		<main className='min-h-screen bg-paper px-4 py-12 text-center text-ink-text sm:px-10'>
			<p className='font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink-blue'>
				{`${profile.name} · ${city}`}
			</p>
			<h1 className='landing-title mt-3 font-display text-4xl text-ink-blue sm:text-6xl'>
				{profile.title}
			</h1>
			<p className='mt-5 text-lg'>How would you like to look around?</p>

			<ul className='mx-auto mt-8 grid max-w-3xl gap-6 text-left min-[720px]:grid-cols-2'>
				<li>
					<Link
						to='/late-shift'
						onClick={onChooseLateShift}
						className='door'
						aria-describedby='door-late-shift-text'
					>
						<span className='door-preview door-room' aria-hidden='true'>
							<span className='door-room-window' />
							<span className='door-room-laptop' />
							<span className='door-room-phone' />
							<span className='door-room-lamp' />
						</span>
						<span className='door-title'>The Late Shift →</span>
						<span id='door-late-shift-text' className='door-text'>
							Step into my room: an interactive lofi scene with things to click,
							rain on the window and an optional radio.
						</span>
						<span className='door-meta'>
							Works on desktop &amp; mobile · Sound optional · ~2 min
						</span>
					</Link>
				</li>
				<li>
					<Link
						to='/quick'
						onClick={onChooseQuick}
						className='door'
						aria-describedby='door-quick-text'
					>
						<span className='door-preview door-plain' aria-hidden='true'>
							<i />
							<i />
							<i />
							<i />
							<i />
						</span>
						<span className='door-title'>The Quick Read →</span>
						<span id='door-quick-text' className='door-text'>
							Everything on one clean page. Fast, keyboard and screen-reader
							friendly, WCAG 2.2 AA.
						</span>
						<span className='door-meta'>Any device · No motion · ~30 sec</span>
					</Link>
				</li>
			</ul>

			<p className='mt-8 text-sm'>
				<label
					htmlFor='remember-choice'
					className='inline-flex min-h-6 items-center gap-2'
				>
					<input
						id='remember-choice'
						type='checkbox'
						checked={isRemembering}
						onChange={onRememberChange}
						className='h-5 w-5 accent-[#3255a4]'
					/>
					Remember my choice
				</label>
				<span className='block'>
					You can switch at any time from either version.
				</span>
			</p>
		</main>
	)
}
