import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { LocationProbe, renderRoute, setReducedMotion } from '../../testUtils'
import type { RoomEngine, RoomEngineOptions } from '../engine/roomEngine'
import LateShift from '../LateShift'
import useScrollIntoPhone from '../ui/useScrollIntoPhone'

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
		createRoomEngine: vi.fn<[HTMLCanvasElement, RoomEngineOptions], RoomEngine>(
			() => mockEngine
		)
	}
})
vi.mock('../engine/roomEngine', () => ({ createRoomEngine }))
vi.mock('../audio/lofiRadio', () => ({
	createLofiRadio: () => ({
		start: vi.fn(async () => {}),
		stop: vi.fn(),
		isPlaying: vi.fn(() => false),
		dispose: vi.fn()
	})
}))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

function BackButton() {
	const navigate = useNavigate()
	const onBack = () => navigate(-1)
	return (
		<button type='button' onClick={onBack}>
			test back
		</button>
	)
}

describe('Late Shift review fixes', () => {
	beforeEach(() => setReducedMotion(true))

	it('keeps the version links inside the pinned room so scrubbing never hides them', () => {
		renderRoute('/late-shift', routes)
		const pinned = screen.getByTestId('room-sticky')
		expect(
			within(pinned).getByRole('link', { name: 'Switch version' })
		).toBeInTheDocument()
		expect(
			within(pinned).getByRole('link', { name: 'Read everything on one page' })
		).toBeInTheDocument()
	})

	it('takes the tags out of the tab order as soon as the camera starts moving', async () => {
		setReducedMotion(false)
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		expect(
			screen.getByRole('list', { name: 'Things in the room' })
		).toHaveAttribute('inert')
	})

	it('returns focus to the chip that opened a section', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: '04 · Skills' }))
		expect(
			await screen.findByRole('dialog', { name: 'Skills' })
		).toBeInTheDocument()
		await user.keyboard('{Escape}')
		await waitFor(() =>
			expect(screen.getByRole('button', { name: '04 · Skills' })).toHaveFocus()
		)
	})

	it('opens sections from chips in fallback mode and returns focus to the chip', async () => {
		createRoomEngine.mockImplementationOnce(() => {
			throw new Error('Canvas 2D is not available')
		})
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: '03 · Experience' }))
		expect(
			await screen.findByRole('dialog', { name: 'Experience' })
		).toBeInTheDocument()
		await user.keyboard('{Escape}')
		await waitFor(() =>
			expect(
				screen.getByRole('button', { name: '03 · Experience' })
			).toHaveFocus()
		)
	})

	it('falls back when the canvas fails while drawing', () => {
		renderRoute('/late-shift', routes)
		const options = createRoomEngine.mock.calls.at(-1)?.[1]
		act(() => options?.onError?.(new Error('roundRect is not a function')))
		expect(
			screen.getByText(/couldn’t be drawn on this device/i)
		).toBeInTheDocument()
	})

	it('arrives at the Android section only once per scroll', async () => {
		const user = userEvent.setup()
		render(
			<MemoryRouter initialEntries={['/late-shift']}>
				<Routes>{routes}</Routes>
				<BackButton />
				<LocationProbe />
			</MemoryRouter>
		)
		const { onArrive } =
			vi.mocked(useScrollIntoPhone).mock.calls.at(-1)?.[0] ?? {}
		act(() => {
			onArrive?.()
			onArrive?.()
		})
		expect(screen.getByTestId('location')).toHaveTextContent(
			'/late-shift/android'
		)
		await user.click(screen.getByRole('button', { name: 'test back' }))
		expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
	})

	it('ignores resize events that change nothing', () => {
		renderRoute('/late-shift', routes)
		vi.mocked(engine.setLayout).mockClear()
		act(() => {
			window.dispatchEvent(new Event('resize'))
			window.dispatchEvent(new Event('resize'))
		})
		expect(engine.setLayout).not.toHaveBeenCalled()
	})
})
