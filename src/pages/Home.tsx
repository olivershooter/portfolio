import About from 'section/About'
import Education from 'section/Education'
import Jobs from 'section/Employment'
import Skills from 'section/Skills'

const Home = () => (
	<div className='mx-auto max-w-6xl px-4 py-12'>
		<div className='flex-col'>
			<About />
			<Jobs />
			<Education />
			<Skills />
		</div>
	</div>
)

export default Home
