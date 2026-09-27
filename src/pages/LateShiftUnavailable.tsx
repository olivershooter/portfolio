import { Link } from 'react-router-dom'

/** Shown when the Late Shift's code can't be downloaded (offline, or a stale deploy). */
export default function LateShiftUnavailable() {
	return (
		<main className='min-h-screen bg-paper px-4 py-16 text-center text-ink-text'>
			<h1 className='font-display text-3xl text-ink-blue'>
				The Late Shift couldn’t load
			</h1>
			<p className='mx-auto mt-4 max-w-prose'>
				The room didn’t download, probably a patchy connection. Everything is
				on the Quick Read, or refresh to try the room again.
			</p>
			<p className='mt-6'>
				<Link className='font-bold text-ink-blue underline' to='/quick'>
					Read the Quick Read
				</Link>
			</p>
		</main>
	)
}
