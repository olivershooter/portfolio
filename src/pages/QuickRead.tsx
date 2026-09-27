import { profile } from '../content'

export default function QuickRead() {
	return (
		<main className='quick p-8'>
			<h1>{`${profile.title} in ${profile.location.split(',')[0]}`}</h1>
		</main>
	)
}
