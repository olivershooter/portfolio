import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderApp(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<App />
		</MemoryRouter>
	)
}

describe('routes', () => {
	it('shows the chooser at /', () => {
		renderApp('/')
		expect(
			screen.getByRole('heading', {
				level: 1,
				name: 'Software & Android Engineer'
			})
		).toBeInTheDocument()
	})

	it('shows the Quick Read at /quick', () => {
		renderApp('/quick')
		expect(
			screen.getByRole('heading', {
				level: 1,
				name: 'Software & Android Engineer in Manchester'
			})
		).toBeInTheDocument()
	})

	it('lazy-loads the Late Shift at /late-shift', async () => {
		renderApp('/late-shift')
		expect(
			await screen.findByRole('heading', { level: 1, name: /the late shift/i })
		).toBeInTheDocument()
	})

	it('sends unknown paths to the chooser', () => {
		renderApp('/nowhere')
		expect(
			screen.getByRole('heading', {
				level: 1,
				name: 'Software & Android Engineer'
			})
		).toBeInTheDocument()
	})
})
