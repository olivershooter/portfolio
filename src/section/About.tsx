const About = () => (
	<div className='mt-4'>
		<h2 className='text-lg font-bold'>About me</h2>
		<p className='mt-2'>
			Hi there! My name is Oliver and I&apos;m a
			<span className='text-md relative mx-1 inline-block stroke-current font-extrabold text-green-500'>
				software engineer
				<svg
					className='absolute -bottom-0.5 max-h-1.5 w-full'
					viewBox='0 0 55 5'
					xmlns='http://www.w3.org/2000/svg'
					preserveAspectRatio='none'
				>
					<path
						d='M0.652466 4.00002C15.8925 2.66668 48.0351 0.400018 54.6853 2.00002'
						strokeWidth='2'
					/>
				</svg>
			</span>
			specializing in full-stack development. I&apos;ve worked with technologies
			like Java, Python, JavaScript, TypeScript, React, Vite, and more. Along
			the way, I&apos;ve helped build products from the ground up with
			stakeholders, optimized infrastructure using Kubernetes and Openshift,
			streamlined CI/CD pipelines, and created accessible products that meet
			WCAG 2.1 AA standards. I&apos;ve also led teams with an inclusive
			approach, fostering collaboration and innovation.
		</p>

		<p className='mt-2'>
			I enjoy reading, gaming, and I&apos;m an avid homelabber.
		</p>
	</div>
)

export default About
