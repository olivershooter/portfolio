import TimelineItem from 'components/Timeline'

const Education = () => {
	const Birmingham = (
		<ul className='list-disc'>
			Graduate coursework:
			<div className='ml-8'>
				<li>Artificial Intelligence & Machine Learning</li>
				<li>Data Structures</li>
				<li>Algorithms & Databases</li>
				<li>Full Stack Application Development</li>
				<li>Object Oriented Programming</li>
				<li>Software Engineering and Professional Practice</li>
				<li>Building Useable Systems and Computer Systems</li>
			</div>
		</ul>
	)

	const Lincoln = (
		<ul className='list-disc'>
			Undergraduate coursework:
			<div className='ml-8'>
				<li>Storytelling</li>
				<li>Narrative and Audience</li>
				<li>Media Fundamentals</li>
				<li>Introduction to Digital Media</li>
				<li>Innovative Design</li>
				<li>Introduction to Studio Production</li>
				<li>Principles of Design Thinking</li>
				<li>Graduation Project: Making a 20 minute TV pilot</li>
			</div>
		</ul>
	)

	return (
		<div className='mt-12'>
			<h2 className='text-lg font-bold'>Education</h2>
			<ol className='relative ml-4 mt-4 border-s border-gray-200'>
				<TimelineItem
					jobTitle='MSc Computer Science'
					isEducation
					company='University of Birmingham'
					dateFrom='September 2020'
					dateTo='October 2021'
					description={Birmingham}
				/>
				<TimelineItem
					jobTitle='BA Media Production'
					isEducation
					company='University of Lincoln'
					dateFrom='September 2014'
					dateTo='June 2017'
					description={Lincoln}
				/>
			</ol>
		</div>
	)
}

export default Education
