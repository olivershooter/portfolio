import { render, type RenderResult } from '@testing-library/react'
import axe from 'axe-core'
import type { ReactElement } from 'react'
import { MemoryRouter, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'

export function setReducedMotion(isReduced: boolean): void {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: isReduced && query.includes('prefers-reduced-motion'),
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(() => false)
	}))
}

export function LocationProbe() {
	const location = useLocation()
	return (
		<output data-testid='location'>
			{location.pathname + location.search}
		</output>
	)
}

export function renderRoute(path: string, routes: ReactElement): RenderResult {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>{routes}</Routes>
			<LocationProbe />
		</MemoryRouter>
	)
}

export async function axeViolations(): Promise<string[]> {
	const results = await axe.run(document.body, {
		rules: { 'color-contrast': { enabled: false } }
	})
	return results.violations.map(
		violation =>
			`${violation.id}: ${violation.nodes
				.map(node => node.target.join(' '))
				.join(', ')}`
	)
}
