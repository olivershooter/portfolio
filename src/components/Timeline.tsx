// Start of Selection
import { ThemeContext } from 'context/ThemeContext'
import React, { useContext } from 'react'

interface TimelineItemProperties {
	jobTitle: string
	isEducation?: boolean
	company: string
	dateFrom: string
	dateTo: string
	description: JSX.Element | string
	isLatest?: boolean
}

const TimelineItem: React.FC<TimelineItemProperties> = ({
	jobTitle,
	isEducation,
	company,
	dateFrom,
	dateTo,
	description,
	isLatest = false
}) => {
	const { theme } = useContext(ThemeContext)
	return (
		<li className='mb-10 ms-6'>
			<span
				className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${theme === 'dark' ? 'ring-slate-800' : 'ring-white'}`}
			>
				{isEducation ? (
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M22 9l-10 -4l-10 4l10 4l10 -4v6' />
						<path d='M6 10.6v5.4a6 3 0 0 0 12 0v-5.4' />
					</svg>
				) : (
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9z' />
						<path d='M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2' />
					</svg>
				)}
			</span>
			<h3
				className={`mb-1 ml-2 flex items-center text-lg font-semibold ${isLatest ? 'flex items-center' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
			>
				{jobTitle} - {company}
				{isLatest ? (
					<span className='me-2 ms-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800'>
						Latest
					</span>
				) : undefined}
			</h3>
			<time
				className={`mb-2 ml-2 block text-sm font-normal leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
			>
				{dateFrom} - {dateTo}
			</time>
			<p
				className={`ml-2 text-base font-normal ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}
			>
				{description}
			</p>
		</li>
	)
}

export default TimelineItem
