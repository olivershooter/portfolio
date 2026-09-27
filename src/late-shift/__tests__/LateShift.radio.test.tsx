import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { renderRoute } from '../../testUtils'
import LateShift from '../LateShift'

const { radio } = vi.hoisted(() => ({
	radio: {
		start: vi.fn(async () => {}),
		stop: vi.fn(),
		isPlaying: vi.fn(() => false)
	}
}))
vi.mock('../audio/lofiRadio', () => ({ createLofiRadio: () => radio }))
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

describe('LOFI FM', () => {
	it('starts and stops the radio from the cassette deck', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Lofi radio' }))
		expect(radio.start).toHaveBeenCalledTimes(1)
		expect(window.sessionStorage.getItem('os-portfolio:radio')).toBe('on')
		expect(
			screen.getByText('♪ lofi fm · rain on oxford road')
		).toBeInTheDocument()
		radio.isPlaying.mockReturnValue(true)
		await user.click(screen.getByRole('button', { name: '♪ Lofi radio' }))
		expect(radio.stop).toHaveBeenCalledTimes(1)
		expect(window.sessionStorage.getItem('os-portfolio:radio')).toBe('off')
	})

	it('offers to resume when the radio was on earlier this session', () => {
		window.sessionStorage.setItem('os-portfolio:radio', 'on')
		renderRoute('/late-shift', routes)
		expect(screen.getByText(/radio paused/i)).toBeInTheDocument()
		expect(radio.start).not.toHaveBeenCalled()
	})
})
