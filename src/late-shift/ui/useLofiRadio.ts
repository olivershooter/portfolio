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
		const record = (on: boolean) => {
			setIsOn(on)
			writeStored('session', RADIO_KEY, on ? 'on' : 'off')
		}
		if (next) {
			radio.current.start().catch(() => record(false))
		} else radio.current.stop()
		record(next)
		track('radio-toggled', { on: next })
	}, [])

	useEffect(
		() => () => {
			radio.current?.dispose()
		},
		[]
	)

	return { isOn, wasOn, onToggle }
}
