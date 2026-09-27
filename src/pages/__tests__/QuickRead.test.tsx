import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { experience, profile, projects, skills } from '../../content'
import { axeViolations } from '../../testUtils'
import QuickRead from '../QuickRead'

function renderPage() {
	return render(
		<MemoryRouter>
			<QuickRead />
		</MemoryRouter>
	)
}

describe('The Quick Read', () => {
	it('has landmarks and a single h1', () => {
		renderPage()
		expect(screen.getByRole('banner')).toBeInTheDocument()
		expect(
			screen.getByRole('navigation', { name: 'Sections' })
		).toBeInTheDocument()
		expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
		expect(screen.getByRole('contentinfo')).toBeInTheDocument()
		expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
	})

	it('orders the section headings', () => {
		renderPage()
		const names = screen
			.getAllByRole('heading', { level: 2 })
			.map(heading => heading.textContent)
		expect(names).toEqual([
			'Android',
			'Experience',
			'Projects',
			'Skills',
			'Contact'
		])
	})

	it('has a skip link and nav links that all point at real sections', () => {
		renderPage()
		expect(
			screen.getByRole('link', { name: 'Skip to content' })
		).toHaveAttribute('href', '#main')
		const nav = screen.getByRole('navigation', { name: 'Sections' })
		const sections = [
			['about', 'Software & Android Engineer in Manchester'],
			['android', 'Android'],
			['experience', 'Experience'],
			['projects', 'Projects'],
			['skills', 'Skills'],
			['contact', 'Contact']
		] as const
		const links = within(nav).getAllByRole('link')
		expect(links).toHaveLength(sections.length)
		for (const [index, [id, heading]] of sections.entries()) {
			expect(links[index]).toHaveAttribute('href', `#${id}`)
			expect(screen.getByRole('region', { name: heading })).toHaveAttribute(
				'id',
				id
			)
		}
	})

	it('renders every role, project and skill group from content', () => {
		renderPage()
		for (const role of experience)
			expect(
				screen.getByRole('heading', { level: 3, name: role.title })
			).toBeInTheDocument()
		for (const project of projects) {
			expect(
				screen.getAllByRole('heading', { level: 3, name: project.name }).length
			).toBeGreaterThan(0)
			expect(screen.getByAltText(project.alt)).toBeInTheDocument()
		}
		for (const group of skills)
			expect(
				screen.getByRole('heading', { level: 3, name: group.title })
			).toBeInTheDocument()
		expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
			'href',
			`mailto:${profile.email}`
		)
	})

	it('links to the other version', () => {
		renderPage()
		expect(
			screen.getByRole('link', { name: 'Visit The Late Shift' })
		).toHaveAttribute('href', '/late-shift')
		expect(
			screen.getByRole('link', { name: 'Switch version' })
		).toBeInTheDocument()
	})

	it('has no axe violations', async () => {
		renderPage()
		expect(await axeViolations()).toEqual([])
	})
})
