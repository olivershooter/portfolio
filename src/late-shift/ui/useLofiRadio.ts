import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { track } from '../../lib/analytics'
import { readStored, writeStored } from '../../lib/storage'
import { createLofiRadio, type LofiRadio } from '../audio/lofiRadio'

const RADIO_KEY = 'os-portfolio:radio'

export default function useLofiRadio() {
	const radio = useRef<LofiRadio | null>(null)
	const [isOn, setIsOn] = useState(false)
	const wasOn = useMemo(() => readStored('session', RADIO_KEY) === 'on', [])

	const onToggle = useCallback(() => {
		radio.current ??= createLofiRadio()
		const next = !radio.current.isPlaying()
		if (next) void radio.current.start()
		else radio.current.stop()
		setIsOn(next)
		writeStored('session', RADIO_KEY, next ? 'on' : 'off')
		track('radio-toggled', { on: next })
	}, [])

	useEffect(
		() => () => {
			radio.current?.stop()
		},
		[]
	)

	return { isOn, wasOn, onToggle }
}
