import { act, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { renderRoute, setReducedMotion } from '../../testUtils'
import type { RoomEngine, RoomEngineOptions } from '../engine/roomEngine'
import LateShift from '../LateShift'

const { createRoomEngine } = vi.hoisted(() => ({
	createRoomEngine: vi.fn<[HTMLCanvasElement, RoomEngineOptions], RoomEngine>(
		() => ({
			setLayout: vi.fn(),
			setHover: vi.fn(),
			setHighlight: vi.fn(),
			setCamera: vi.fn(),
			setRadio: vi.fn(),
			setTodMode: vi.fn(),
			setPaused: vi.fn(),
			destroy: vi.fn()
		})
	)
}))
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

function sectionOpenedCalls(calls: readonly (readonly unknown[])[]) {
	return calls.filter(([event]) => event === 'section-opened')
}

describe('Late Shift polish', () => {
	it('opens deep links with a trailing slash', async () => {
		setReducedMotion(true)
		renderRoute('/late-shift/about/', routes)
		expect(
			await screen.findByRole('dialog', { name: 'About me' })
		).toBeInTheDocument()
	})

	it('keeps an open section (and counts it once) when the canvas fails', async () => {
		setReducedMotion(true)
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/late-shift/about', routes)
		expect(
			await screen.findByRole('dialog', { name: 'About me' })
		).toBeInTheDocument()
		const options = createRoomEngine.mock.calls.at(-1)?.[1]
		act(() => options?.onError?.(new Error('lost context')))
		expect(screen.getByRole('dialog', { name: 'About me' })).toBeInTheDocument()
		expect(sectionOpenedCalls(spy.mock.calls)).toHaveLength(1)
	})

	// A real flight takes at least 900 ms; 700 ms proves it jumped, with headroom under load
	it('jumps straight to a deep link even under StrictMode', async () => {
		const spy = vi.spyOn(analytics, 'track')
		render(
			<StrictMode>
				<MemoryRouter initialEntries={['/late-shift/about']}>
					<Routes>{routes}</Routes>
				</MemoryRouter>
			</StrictMode>
		)
		expect(
			await screen.findByRole('dialog', { name: 'About me' }, { timeout: 700 })
		).toBeInTheDocument()
		expect(sectionOpenedCalls(spy.mock.calls)).toHaveLength(1)
	})
})
