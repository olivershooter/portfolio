import { Link } from 'react-router-dom'
import { profile } from '../content'

export default function Landing() {
	return (
		<main className='p-8'>
			<h1 className='font-display text-4xl text-ink-blue'>{profile.title}</h1>
			<Link to='/late-shift'>The Late Shift</Link>
			<Link to='/quick'>The Quick Read</Link>
		</main>
	)
}
