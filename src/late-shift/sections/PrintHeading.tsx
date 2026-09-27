import { forwardRef } from 'react'

interface PrintHeadingProperties {
	readonly id: string
	readonly children: string
	readonly tabIndex?: number
}

/** Blue ink is the real text; the pink plate is a decorative, hidden copy that slides into register. */
const PrintHeading = forwardRef<HTMLHeadingElement, PrintHeadingProperties>(
	({ id, children, tabIndex }, reference) => (
		<h1 ref={reference} id={id} tabIndex={tabIndex} className='print-heading'>
			<span className='print-heading-ink' aria-hidden='true'>
				{children}
			</span>
			<span className='print-heading-text'>{children}</span>
		</h1>
	)
)
PrintHeading.displayName = 'PrintHeading'

export default PrintHeading
