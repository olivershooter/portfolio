import { Link } from 'react-router-dom'

export default function SwitchVersionLink({
	className
}: {
	readonly className?: string
}) {
	return (
		<Link to='/?choose' className={className}>
			Switch version
		</Link>
	)
}
