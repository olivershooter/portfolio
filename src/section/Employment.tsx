import TimelineItem from 'components/Timeline'

const Jobs = () => {
	const civilService = (
		<ul className='list-disc'>
			<div className='ml-8'>
				<li>
					Building full stack applications, picking up variety of tickets from
					backend (Java Spring Boot) to frontend (React/Typescript).
				</li>
				<li>
					Collaborated with stakeholders, product owners, and customers to
					design and deliver products from concept to completion.
				</li>
				<li>
					Designed and implemented robust system architecture, including both
					microservices and monolithic patterns, focusing on scalability,
					maintainability.
				</li>
				<li>
					Developed robust testing, E2E using Cypress/Playwright, along with
					unit testing with Jest/Junit.
				</li>
				<li>
					Led diverse teams across hybrid work environments, fostering
					collaboration and inclusiveness whether working remotely or in person.
				</li>
			</div>
		</ul>
	)

	const EPIK = (
		<ul className='list-disc'>
			<div className='ml-8'>
				<li>Independently managing a classroom of 20+ children.</li>
				<li>
					Organizing lesson plans and creating new lessons from scratch and/or
					from predetermined material.
				</li>
				<li>
					Flexibility and strong communication skills in teaching and working
					with colleagues due to language barrier and new culture.
				</li>
			</div>
		</ul>
	)
	return (
		<div className='mt-12'>
			<h2 className='text-lg font-bold'>Employment</h2>
			<ol className='relative ml-4 mt-4 border-s border-gray-200'>
				<TimelineItem
					jobTitle='Software Engineer'
					company="His Majesty's Government"
					dateFrom='October 2022'
					dateTo='Current'
					description={civilService}
					isLatest
				/>
				<TimelineItem
					jobTitle='Native English Teacher'
					company='English Teaching in Korea (EPIK)'
					dateFrom='February 2018'
					dateTo='March 2020'
					description={EPIK}
				/>
			</ol>
		</div>
	)
}

export default Jobs
