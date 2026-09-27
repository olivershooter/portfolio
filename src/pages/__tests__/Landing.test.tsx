import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { VERSION_KEY } from '../../lib/versionChoice'
import { axeViolations, renderRoute } from '../../testUtils'
import Landing from '../Landing'

const routes = (
	<>
		<Route path='/' element={<Landing />} />
		<Route path='/quick' element={<p>quick page</p>} />
		<Route path='/late-shift' element={<p>late shift page</p>} />
	</>
)

describe('Landing', () => {
	it('offers both versions as links', () => {
		renderRoute('/', routes)
		expect(
			screen.getByRole('link', { name: /the late shift/i })
		).toHaveAttribute('href', '/late-shift')
		expect(
			screen.getByRole('link', { name: /the quick read/i })
		).toHaveAttribute('href', '/quick')
	})

	it('remembers the choice when asked and tracks it', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/', routes)
		await user.click(
			screen.getByRole('checkbox', { name: /remember my choice/i })
		)
		await user.click(screen.getByRole('link', { name: /the quick read/i }))
		expect(window.localStorage.getItem(VERSION_KEY)).toBe('quick')
		expect(spy).toHaveBeenCalledWith('version-chosen', { version: 'quick' })
		expect(screen.getByText('quick page')).toBeInTheDocument()
	})

	it('does not remember unless asked', async () => {
		const user = userEvent.setup()
		renderRoute('/', routes)
		await user.click(screen.getByRole('link', { name: /the late shift/i }))
		expect(window.localStorage.getItem(VERSION_KEY)).toBeNull()
		expect(screen.getByText('late shift page')).toBeInTheDocument()
	})

	it('redirects straight to a remembered version', () => {
		window.localStorage.setItem(VERSION_KEY, 'late-shift')
		renderRoute('/', routes)
		expect(screen.getByText('late shift page')).toBeInTheDocument()
	})

	it('shows the chooser with ?choose and forgets the choice', () => {
		window.localStorage.setItem(VERSION_KEY, 'quick')
		renderRoute('/?choose', routes)
		expect(
			screen.getByRole('link', { name: /the quick read/i })
		).toBeInTheDocument()
		expect(window.localStorage.getItem(VERSION_KEY)).toBeNull()
	})

	it('has no axe violations', async () => {
		renderRoute('/', routes)
		expect(await axeViolations()).toEqual([])
	})

	it('names each door by its title and reads its description once', () => {
		renderRoute('/', routes)
		const lateShift = screen.getByRole('link', { name: 'The Late Shift →' })
		expect(lateShift).toHaveAccessibleDescription(/step into my room/i)
		const quick = screen.getByRole('link', { name: 'The Quick Read →' })
		expect(quick).toHaveAccessibleDescription(/everything on one clean page/i)
	})
})
