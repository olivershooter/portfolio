/* eslint-disable react/jsx-handler-names */
import React, { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useContext(ThemeContext)

	return (
		<button
			type='button'
			className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}
			onClick={toggleTheme}
			aria-label={
				theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
			}
		>
			{theme === 'dark' ? (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width={24}
					height={24}
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0' />
					<path d='M4 12h.01' /> <path d='M12 4v.01' /> <path d='M20 12h.01' />
					<path d='M12 20v.01' /> <path d='M6.31 6.31l-.01 -.01' />
					<path d='M17.71 6.31l-.01 -.01' /> <path d='M17.7 17.7l.01 .01' />
					<path d='M6.3 17.7l.01 .01' />
				</svg>
			) : (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width={24}
					height={24}
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' />
				</svg>
			)}
		</button>
	)
}

export default ThemeToggle
