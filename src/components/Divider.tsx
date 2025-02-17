import { ThemeContext } from 'context/ThemeContext'
import { useContext } from 'react'

const Divider = () => {
	const { theme } = useContext(ThemeContext)

	return (
		<h3 className='flex w-full items-center'>
			<span className='h-1 flex-grow rounded bg-gray-200' />
			<span className='mx-3'>
				{theme === 'dark' ? (
					<img
						src='assets/OS_logo_dark.svg'
						alt='OS Logo Dark'
						className='h-12 w-12'
					/>
				) : (
					<img src='assets/OS_logo.svg' alt='OS Logo' className='h-12 w-12' />
				)}
			</span>
			<span className='h-1 flex-grow rounded bg-gray-200' />
		</h3>
	)
}

export default Divider
