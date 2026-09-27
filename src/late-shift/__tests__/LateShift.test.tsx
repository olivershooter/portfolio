import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { axeViolations, renderRoute } from '../../testUtils'
import type { RoomEngine } from '../engine/roomEngine'
import LateShift from '../LateShift'

// Mock factories are hoisted above imports, so shared mocks must be created with vi.hoisted
const { engine, createRoomEngine } = vi.hoisted(() => {
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
	return {
		engine: mockEngine,
		createRoomEngine: vi.fn((): RoomEngine => mockEngine)
	}
})

vi.mock('../engine/roomEngine', () => ({ createRoomEngine }))
// jsdom has no AudioContext; the real radio would reject when started
vi.mock('../audio/lofiRadio', () => ({
	createLofiRadio: () => ({
		start: vi.fn(async () => {}),
		stop: vi.fn(),
		isPlaying: vi.fn(() => false)
	})
}))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

describe('The Late Shift shell', () => {
	it('renders the room with a title, a hidden canvas, tags and chips', () => {
		renderRoute('/late-shift', routes)
		expect(
			screen.getByRole('heading', { level: 1, name: /the late shift/i })
		).toBeInTheDocument()
		const tags = screen.getByRole('list', { name: 'Things in the room' })
		expect(within(tags).getAllByRole('button')).toHaveLength(9)
		const chips = screen.getByRole('navigation', { name: 'Sections' })
		expect(within(chips).getAllByRole('button')).toHaveLength(9)
		expect(
			within(chips).getByRole('button', { name: '01 · About me' })
		).toBeInTheDocument()
	})

	it('highlights an object when its chip is hovered or focused', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.hover(screen.getByRole('button', { name: '03 · Experience' }))
		expect(engine.setHighlight).toHaveBeenLastCalledWith('experience')
		await user.unhover(screen.getByRole('button', { name: '03 · Experience' }))
		expect(engine.setHighlight).toHaveBeenLastCalledWith(null)
	})

	it('navigates to a section when a tag is clicked', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		expect(screen.getByTestId('location')).toHaveTextContent(
			'/late-shift/experience'
		)
	})

	it('toggles the radio from its tag', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/late-shift', routes)
		const radio = screen.getByRole('button', { name: 'Lofi radio' })
		expect(radio).toHaveAttribute('aria-pressed', 'false')
		await user.click(radio)
		expect(radio).toHaveAttribute('aria-pressed', 'true')
		expect(engine.setRadio).toHaveBeenLastCalledWith(true)
		expect(spy).toHaveBeenCalledWith('radio-toggled', { on: true })
	})

	it('applies ?tod= and ?hover= for screenshots', () => {
		renderRoute('/late-shift?tod=night&hover=android', routes)
		expect(engine.setTodMode).toHaveBeenLastCalledWith('night')
		expect(engine.setHighlight).toHaveBeenLastCalledWith('android')
	})

	it('still works when the canvas cannot be created', async () => {
		createRoomEngine.mockImplementationOnce(() => {
			throw new Error('Canvas 2D is not available')
		})
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		expect(
			screen.getByText(/couldn’t be drawn on this device/i)
		).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: '04 · Skills' }))
		expect(screen.getByTestId('location')).toHaveTextContent(
			'/late-shift/skills'
		)
	})

	it('has no axe violations', async () => {
		renderRoute('/late-shift', routes)
		expect(await axeViolations()).toEqual([])
	})
})
