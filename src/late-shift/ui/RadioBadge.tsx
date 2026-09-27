interface RadioBadgeProperties {
	readonly isOn: boolean
	readonly isCompact: boolean
	readonly hasPaused?: boolean
}

export default function RadioBadge({
	isOn,
	isCompact,
	hasPaused = false
}: RadioBadgeProperties) {
	let text = '♪ Radio off · try the cassette deck'
	if (isOn) text = '♪ lofi fm · rain on oxford road'
	else if (hasPaused)
		text = '♪ Radio paused · press the cassette deck to resume'
	return (
		<p
			className={`radio-badge${isCompact ? ' is-compact' : ''}`}
			aria-live='polite'
		>
			{text}
		</p>
	)
}
