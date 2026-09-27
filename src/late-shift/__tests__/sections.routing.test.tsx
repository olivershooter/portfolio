import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { renderRoute, setReducedMotion } from '../../testUtils'
import type { RoomEngine } from '../engine/roomEngine'
import LateShift from '../LateShift'

const { engine } = vi.hoisted(() => {
	const mockEngine: RoomEngine = {
		setLayout: vi.fn(),
		setHover: vi.fn(),
		setHighlight: vi.fn(),
		setCamera: vi.fn(),
		setRadio: vi.fn(),
		setTodMode: vi.fn(),
		setPaused: vi.fn(),
		destroy: vi.fn()
	}
	return { engine: mockEngine }
})
vi.mock('../engine/roomEngine', () => ({ createRoomEngine: () => engine }))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

function setViewport(width: number, height: number) {
	Object.defineProperty(window, 'innerWidth', {
		configurable: true,
		value: width
	})
	Object.defineProperty(window, 'innerHeight', {
		configurable: true,
		value: height
	})
}

describe('Late Shift sections', () => {
	beforeEach(() => setReducedMotion(true))
	afterEach(() => setViewport(1024, 768))

	it('opens a section from a tag and focuses its heading', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		const dialog = await screen.findByRole('dialog', { name: 'Experience' })
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' })
		).toHaveFocus()
		expect(engine.setCamera).toHaveBeenLastCalledWith('experience', 1)
		expect(spy).toHaveBeenCalledWith('section-opened', {
			section: 'experience',
			version: 'late-shift'
		})
	})

	it('closes with Escape, returns to the room and restores focus to the tag', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift/experience', routes)
		expect(
			await screen.findByRole('dialog', { name: 'Experience' })
		).toBeInTheDocument()
		await user.keyboard('{Escape}')
		await waitFor(() =>
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		)
		expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Experience' })).toHaveFocus()
		)
		expect(engine.setCamera).toHaveBeenLastCalledWith('experience', 0)
	})

	it('deep-links to a nested project section, already zoomed', async () => {
		renderRoute('/late-shift/projects/screendle', routes)
		expect(
			await screen.findByRole('dialog', { name: 'Screendle' })
		).toBeInTheDocument()
		expect(engine.setCamera).toHaveBeenCalledWith('screendle', 1)
		expect(
			screen.getByRole('heading', { level: 1, name: 'Screendle' })
		).toHaveFocus()
	})

	it('redirects unknown sections to the room', async () => {
		renderRoute('/late-shift/nope', routes)
		await waitFor(() =>
			expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
		)
	})

	it('opens only the last of two rapid activations', async () => {
		setReducedMotion(false)
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		await user.click(screen.getByRole('button', { name: '04 · Skills' }))
		expect(
			await screen.findByRole('dialog', { name: 'Skills' }, { timeout: 3000 })
		).toBeInTheDocument()
		await new Promise(resolve => {
			setTimeout(resolve, 1200)
		})
		expect(
			screen.queryByRole('dialog', { name: 'Experience' })
		).not.toBeInTheDocument()
	})

	it('keeps the section open and re-lays out the engine on resize', async () => {
		renderRoute('/late-shift/about', routes)
		expect(
			await screen.findByRole('dialog', { name: 'About me' })
		).toBeInTheDocument()
		act(() => {
			setViewport(390, 844)
			window.dispatchEvent(new Event('resize'))
		})
		expect(engine.setLayout).toHaveBeenLastCalledWith(
			'phone',
			expect.any(Number),
			expect.any(Number)
		)
		expect(screen.getByRole('dialog', { name: 'About me' })).toBeInTheDocument()
		expect(engine.setCamera).toHaveBeenLastCalledWith('about', 1)
	})

	it('pauses the room while a section covers it', async () => {
		renderRoute('/late-shift/skills', routes)
		expect(
			await screen.findByRole('dialog', { name: 'Skills' })
		).toBeInTheDocument()
		expect(engine.setPaused).toHaveBeenLastCalledWith(true)
	})
})
