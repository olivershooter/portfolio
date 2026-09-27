import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import useFocusTrap from '../useFocusTrap'

function Trap({ onEscape }: { readonly onEscape: () => void }) {
	const reference = useRef<HTMLDivElement>(null)
	useFocusTrap(reference, onEscape)
	return (
		<div ref={reference}>
			<button type='button'>first</button>
			<button type='button'>last</button>
		</div>
	)
}

describe('useFocusTrap', () => {
	it('wraps Tab and Shift+Tab, even without Array.prototype.at (Safari < 15.4)', async () => {
		const user = userEvent.setup()
		const onEscape = vi.fn()
		render(<Trap onEscape={onEscape} />)
		const first = screen.getByRole('button', { name: 'first' })
		const last = screen.getByRole('button', { name: 'last' })
		await user.click(last)
		const original = Object.getOwnPropertyDescriptor(Array.prototype, 'at')
		Reflect.deleteProperty(Array.prototype, 'at')
		try {
			await user.keyboard('{Tab}')
			expect(first).toHaveFocus()
			await user.keyboard('{Shift>}{Tab}{/Shift}')
			expect(last).toHaveFocus()
		} finally {
			// eslint-disable-next-line no-extend-native -- restoring the built-in removed above
			if (original) Object.defineProperty(Array.prototype, 'at', original)
		}
	})

	it('calls onEscape on Escape', async () => {
		const user = userEvent.setup()
		const onEscape = vi.fn()
		render(<Trap onEscape={onEscape} />)
		await user.keyboard('{Escape}')
		expect(onEscape).toHaveBeenCalledTimes(1)
	})
})
