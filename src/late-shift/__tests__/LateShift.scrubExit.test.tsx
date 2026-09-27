import { fireEvent, screen } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { renderRoute, setReducedMotion } from '../../testUtils'
import LateShift from '../LateShift'

vi.mock('../engine/roomEngine', () => ({
	createRoomEngine: () => ({
		setLayout: vi.fn(),
		setHover: vi.fn(),
		setHighlight: vi.fn(),
		setCamera: vi.fn(),
		setRadio: vi.fn(),
		setTodMode: vi.fn(),
		setPaused: vi.fn(),
		destroy: vi.fn()
	})
}))
vi.mock('../audio/lofiRadio', () => ({
	createLofiRadio: () => ({
		start: vi.fn(async () => {}),
		stop: vi.fn(),
		isPlaying: vi.fn(() => false),
		dispose: vi.fn()
	})
}))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

async function openAndroid() {
	renderRoute('/late-shift/android', routes)
	return screen.findByRole('dialog', { name: 'Android' })
}

describe('scrolling back out of the Android section', () => {
	it('flies back to the room when scrolling up at the top', async () => {
		const dialog = await openAndroid()
		fireEvent.wheel(dialog, { deltaY: -60 })
		expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
	})

	it('follows a downward swipe at the top on touch screens', async () => {
		const dialog = await openAndroid()
		fireEvent.touchStart(dialog, { touches: [{ clientY: 100 }] })
		fireEvent.touchMove(dialog, { touches: [{ clientY: 180 }] })
		expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
	})

	it('stays open when scrolling down', async () => {
		const dialog = await openAndroid()
		fireEvent.wheel(dialog, { deltaY: 60 })
		expect(screen.getByTestId('location')).toHaveTextContent(
			'/late-shift/android'
		)
	})

	it('stays open with reduced motion, where there is no scroll-scrub', async () => {
		setReducedMotion(true)
		const dialog = await openAndroid()
		fireEvent.wheel(dialog, { deltaY: -60 })
		expect(screen.getByTestId('location')).toHaveTextContent(
			'/late-shift/android'
		)
	})
})
