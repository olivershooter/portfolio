import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

export default function App() {
	return (
		<div className='scanline bg-bg text-text-base'>
			<div className='kinetic-grid pointer-events-none fixed inset-0 z-0' />
			<Nav />
			<main>
				<Hero />
				<About />
				<Experience />
				<Projects />
				<Skills />
				<Contact />
			</main>
		</div>
	)
}
