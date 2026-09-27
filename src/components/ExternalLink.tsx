import type { ReactNode } from 'react'

interface ExternalLinkProperties {
	readonly href: string
	readonly children: ReactNode
	readonly className?: string
}

export default function ExternalLink({
	href,
	children,
	className
}: ExternalLinkProperties) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className={className}>
			{children}
			<span className='sr-only'> (opens in new tab)</span>
		</a>
	)
}
