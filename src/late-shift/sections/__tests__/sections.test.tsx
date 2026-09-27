import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { experience, getProject, profile, skills } from '../../../content'
import { axeViolations } from '../../../testUtils'
import { SECTION_IDS } from '../../sectionIds'
import PrintHeading from '../PrintHeading'
import { SECTIONS } from '../registry'

function renderSection(id: (typeof SECTION_IDS)[number]) {
	return render(<MemoryRouter>{SECTIONS[id].render()}</MemoryRouter>)
}

describe('section skins', () => {
	it('has an entry for every section id', () => {
		expect(Object.keys(SECTIONS).sort()).toEqual([...SECTION_IDS].sort())
		for (const id of SECTION_IDS)
			expect(SECTIONS[id].title.length).toBeGreaterThan(0)
	})

	it('prints headings as real, readable text', () => {
		render(<PrintHeading id='t'>Experience</PrintHeading>)
		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' })
		).toBeInTheDocument()
	})

	it('plays the story as focusable film frames', () => {
		renderSection('about')
		const strip = screen.getByRole('region', { name: /film frames/i })
		expect(strip).toHaveAttribute('tabindex', '0')
		for (const beat of profile.story)
			expect(screen.getByText(beat.text)).toBeInTheDocument()
	})

	it('shows Android work on the phone', () => {
		renderSection('android')
		expect(
			screen.getByRole('heading', { name: 'Salah Times' })
		).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Candice' })).toBeInTheDocument()
		expect(screen.getByText(experience[0].summary)).toBeInTheDocument()
	})

	it('lets the keyboard move between files in the editor', async () => {
		const user = userEvent.setup()
		renderSection('experience')
		const tabs = screen.getAllByRole('tab')
		expect(tabs.map(tab => tab.textContent)).toEqual([
			...experience.map(role => role.file),
			'msc_birmingham.md',
			'film_2014.mov'
		])
		expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await user.click(tabs[0])
		await user.keyboard('{ArrowDown}')
		expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		expect(tabs[1]).toHaveFocus()
		expect(screen.getByRole('tabpanel')).toHaveTextContent(experience[1].title)
		await user.keyboard('{End}')
		expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true')
		await user.keyboard('{Home}')
		expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await user.keyboard('{ArrowUp}')
		expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true')
	})

	it('opens book spines on the shelf', async () => {
		const user = userEvent.setup()
		renderSection('skills')
		const first = screen.getByRole('button', { name: skills[0].title })
		expect(first).toHaveAttribute('aria-expanded', 'true')
		const second = screen.getByRole('button', { name: skills[1].title })
		await user.click(second)
		expect(second).toHaveAttribute('aria-expanded', 'true')
		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(
			screen.getByRole('list', { name: skills[1].title })
		).toBeInTheDocument()
	})

	it('renders project case studies with links', () => {
		renderSection('projects/candice')
		const project = getProject('candice')
		expect(screen.getByAltText(project.alt)).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
			'href',
			project.links.github
		)
	})

	it('writes the contact postcard', () => {
		renderSection('contact')
		const card = screen.getByRole('article', { name: /postcard/i })
		expect(
			within(card).getByRole('link', { name: profile.email })
		).toHaveAttribute('href', `mailto:${profile.email}`)
	})

	it('has no axe violations across all skins', async () => {
		render(
			<MemoryRouter>
				<main>
					<h1>All sections</h1>
					{SECTION_IDS.map(id => (
						<section key={id} aria-label={SECTIONS[id].title}>
							{SECTIONS[id].render()}
						</section>
					))}
				</main>
			</MemoryRouter>
		)
		expect(await axeViolations()).toEqual([])
	})
})
