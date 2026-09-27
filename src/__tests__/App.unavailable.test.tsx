import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

// Simulates the Late Shift chunk failing to download (offline, stale deploy)
vi.mock('../late-shift/LateShift', () => {
	throw new Error('Failed to fetch dynamically imported module')
})

describe('when the Late Shift cannot load', () => {
	it('explains and points to the Quick Read instead of a blank page', async () => {
		render(
			<MemoryRouter initialEntries={['/late-shift']}>
				<App />
			</MemoryRouter>
		)
		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: /the late shift couldn’t load/i
			})
		).toBeInTheDocument()
		expect(
			screen.getByRole('link', { name: 'Read the Quick Read' })
		).toHaveAttribute('href', '/quick')
	})
})
