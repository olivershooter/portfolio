/* eslint-disable jsx-a11y/label-has-associated-control */
import { ThemeContext } from 'context/ThemeContext'
import { useContext } from 'react'

const Contact = () => {
	const { theme } = useContext(ThemeContext)

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const formData = new FormData(event.currentTarget)
		const name = formData.get('name') as string
		const email = formData.get('email') as string
		const message = formData.get('message') as string

		try {
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email, message })
			})

			if (response.ok) {
				console.log('Email sent successfully!')
			} else {
				console.error('Error sending email:', response.statusText)
			}
		} catch (error) {
			console.error('Error sending email:', error)
		}
	}

	return (
		<div
			id='contact-us'
			className={`overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24 ${
				theme === 'dark' ? 'bg-slate-900' : 'bg-white'
			}`}
		>
			<div className='relative mx-auto max-w-xl'>
				<div className='mt-12'>
					<form
						onSubmit={handleFormSubmit}
						className='grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8'
					>
						<div className='sm:col-span-2'>
							<label
								htmlFor='name'
								id='name-label'
								className={`block text-sm font-medium ${
									theme === 'light' ? 'text-gray-700' : 'text-slate-400'
								}`}
							>
								Name
							</label>
							<div className='mt-1'>
								<input
									aria-labelledby='name-label'
									autoComplete='given-name'
									className={`block w-full rounded-md border ${
										theme === 'light' ? 'border-gray-300' : 'border-white/5'
									} px-4 py-3 shadow-sm focus:border-sky-500 focus:ring-sky-500 ${
										theme === 'light' ? 'bg-white' : 'bg-slate-700/50'
									}`}
									id='name'
									name='name'
									required
									type='text'
								/>
							</div>
						</div>
						<div className='sm:col-span-2'>
							<label
								htmlFor='email'
								className={`block text-sm font-medium ${
									theme === 'light' ? 'text-gray-700' : 'text-slate-400'
								}`}
							>
								Email
							</label>
							<div className='mt-1'>
								<input
									name='email'
									id='email'
									required
									type='email'
									className={`block w-full rounded-md border ${
										theme === 'light' ? 'border-gray-300' : 'border-white/5'
									} px-4 py-3 shadow-sm focus:border-sky-500 focus:ring-sky-500 ${
										theme === 'light' ? 'bg-white' : 'bg-slate-700/50'
									}`}
								/>
							</div>
						</div>
						<div className='sm:col-span-2'>
							<label
								htmlFor='message'
								className={`block text-sm font-medium ${
									theme === 'light' ? 'text-gray-700' : 'text-slate-400'
								}`}
							>
								Message
							</label>
							<div className='mt-1'>
								<textarea
									required
									name='message'
									id='message'
									rows={4}
									className={`block w-full rounded-md border ${
										theme === 'light' ? 'border-gray-300' : 'border-white/5'
									} px-4 py-3 shadow-sm focus:border-sky-500 focus:ring-sky-500 ${
										theme === 'light' ? 'bg-white' : 'bg-slate-700/50'
									}`}
								/>
							</div>
						</div>
						<div className='flex justify-end sm:col-span-2'>
							<button
								type='submit'
								className={`inline-flex items-center rounded-md border border-sky-500 px-4 py-2 font-medium text-sky-500 shadow-sm transition-colors duration-75 ${
									theme === 'light'
										? 'hover:bg-sky-50 focus:outline-none focus-visible:ring focus-visible:ring-sky-500 active:bg-sky-100 disabled:cursor-not-allowed disabled:bg-sky-100'
										: 'hover:bg-gray-900 active:bg-gray-800 disabled:bg-gray-800'
								} sm:text-sm`}
							>
								<span>Send Message</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Contact
