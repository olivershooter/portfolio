import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExternalLink from '../ExternalLink'
import SwitchVersionLink from '../SwitchVersionLink'

describe('shared links', () => {
	it('announces that external links open a new tab', () => {
		render(<ExternalLink href='https://example.com'>GitHub</ExternalLink>)
		const link = screen.getByRole('link', { name: 'GitHub (opens in new tab)' })
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noreferrer')
	})

	it('switches version via the chooser', () => {
		render(
			<MemoryRouter>
				<SwitchVersionLink />
			</MemoryRouter>
		)
		expect(
			screen.getByRole('link', { name: 'Switch version' })
		).toHaveAttribute('href', '/?choose')
	})
})
