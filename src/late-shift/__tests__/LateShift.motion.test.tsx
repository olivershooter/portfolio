import { screen } from '@testing-library/react'
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

const routes = <Route path='/late-shift/*' element={<LateShift />} />

describe('Late Shift motion', () => {
	it('scroll-scrubs into the phone when motion is allowed', () => {
		renderRoute('/late-shift', routes)
		expect(screen.getByRole('main')).toHaveAttribute('data-scroll', 'scrub')
	})

	it('is a static page with reduced motion', () => {
		setReducedMotion(true)
		renderRoute('/late-shift', routes)
		expect(screen.getByRole('main')).toHaveAttribute('data-scroll', 'static')
	})
})
