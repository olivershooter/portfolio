import { render, screen } from '@testing-library/react'

describe('test harness', () => {
	it('has jest-dom matchers and browser API stubs', () => {
		render(<p>ready</p>)
		expect(screen.getByText('ready')).toBeInTheDocument()
		expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
			false
		)
		expect(typeof ResizeObserver).toBe('function')
		expect(typeof IntersectionObserver).toBe('function')
	})
})
