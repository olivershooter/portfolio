export interface LofiRadio {
	readonly start: () => Promise<void>
	readonly stop: () => void
	readonly isPlaying: () => boolean
	/** Stops everything and closes the AudioContext; the radio can start again afterwards. */
	readonly dispose: () => void
}

const BPM = 72
const SIXTEENTH = 60 / BPM / 4
const LOOKAHEAD = 0.12
const TICK_MS = 25
const VOLUME = 0.35
const FADE = 0.6

/** Am7 · Dm9 · G7 · Cmaj7, voiced in MIDI note numbers. */
const CHORDS: readonly (readonly number[])[] = [
	[57, 60, 64, 67],
	[50, 57, 60, 65],
	[55, 59, 62, 65],
	[48, 55, 59, 64]
]
const KICKS = new Set([0, 7, 10])
const SNARES = new Set([4, 12])
const VOICES = [
	['sine', 1, 0.07],
	['triangle', 2, 0.015]
] as const

interface Graph {
	readonly context: AudioContext
	readonly master: GainNode
	readonly music: GainNode
	readonly noise: AudioBuffer
}

interface NoiseHit {
	readonly type: BiquadFilterType
	readonly frequency: number
	readonly level: number
	readonly length: number
}

const midiToHertz = (note: number): number => 440 * 2 ** ((note - 69) / 12)

function createNoise(context: AudioContext): AudioBuffer {
	const buffer = context.createBuffer(
		1,
		context.sampleRate * 2,
		context.sampleRate
	)
	const data = buffer.getChannelData(0)
	for (let index = 0; index < data.length; index += 1)
		data[index] = Math.random() * 2 - 1
	return buffer
}

function buildGraph(context: AudioContext): Graph {
	const master = context.createGain()
	master.gain.value = 0
	const warmth = context.createBiquadFilter()
	warmth.type = 'lowpass'
	warmth.frequency.value = 5000
	master.connect(warmth)
	warmth.connect(context.destination)

	const music = context.createGain()
	const tone = context.createBiquadFilter()
	tone.type = 'lowpass'
	tone.frequency.value = 1800
	music.connect(tone)
	tone.connect(master)

	const tremolo = context.createOscillator()
	tremolo.frequency.value = 4.5
	const depth = context.createGain()
	depth.gain.value = 0.12
	tremolo.connect(depth)
	depth.connect(music.gain)
	tremolo.start()

	return { context, master, music, noise: createNoise(context) }
}

function playChord(
	graph: Graph,
	notes: readonly number[],
	time: number,
	length: number
): void {
	for (const note of notes) {
		for (const [type, multiplier, level] of VOICES) {
			const voice = graph.context.createOscillator()
			voice.type = type
			voice.frequency.value = midiToHertz(note) * multiplier
			const envelope = graph.context.createGain()
			envelope.gain.setValueAtTime(0, time)
			envelope.gain.linearRampToValueAtTime(level, time + 0.03)
			envelope.gain.exponentialRampToValueAtTime(
				level * 0.4,
				time + length * 0.6
			)
			envelope.gain.linearRampToValueAtTime(0, time + length)
			voice.connect(envelope)
			envelope.connect(graph.music)
			voice.start(time)
			voice.stop(time + length + 0.05)
		}
	}
}

function playBass(graph: Graph, note: number, time: number): void {
	const voice = graph.context.createOscillator()
	voice.type = 'sine'
	voice.frequency.value = midiToHertz(note - 12)
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(0.22, time)
	envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.5)
	voice.connect(envelope)
	envelope.connect(graph.master)
	voice.start(time)
	voice.stop(time + 0.55)
}

function playKick(graph: Graph, time: number): void {
	const voice = graph.context.createOscillator()
	voice.frequency.setValueAtTime(120, time)
	voice.frequency.exponentialRampToValueAtTime(45, time + 0.12)
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(0.8, time)
	envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.28)
	voice.connect(envelope)
	envelope.connect(graph.master)
	voice.start(time)
	voice.stop(time + 0.3)
}

function playNoiseHit(graph: Graph, time: number, hit: NoiseHit): void {
	const source = graph.context.createBufferSource()
	source.buffer = graph.noise
	const filter = graph.context.createBiquadFilter()
	filter.type = hit.type
	filter.frequency.value = hit.frequency
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(hit.level, time)
	envelope.gain.exponentialRampToValueAtTime(0.0001, time + hit.length)
	source.connect(filter)
	filter.connect(envelope)
	envelope.connect(graph.master)
	source.start(time, Math.random())
	source.stop(time + hit.length + 0.02)
}

function playRain(graph: Graph): AudioBufferSourceNode {
	const source = graph.context.createBufferSource()
	source.buffer = graph.noise
	source.loop = true
	const filter = graph.context.createBiquadFilter()
	filter.type = 'bandpass'
	filter.frequency.value = 1200
	filter.Q.value = 0.7
	const level = graph.context.createGain()
	level.gain.value = 0.16
	const swell = graph.context.createOscillator()
	swell.frequency.value = 0.05
	const swellDepth = graph.context.createGain()
	swellDepth.gain.value = 0.05
	swell.connect(swellDepth)
	swellDepth.connect(level.gain)
	swell.start()
	source.connect(filter)
	filter.connect(level)
	level.connect(graph.master)
	source.start()
	source.addEventListener('ended', () => swell.stop())
	return source
}

function scheduleStep(graph: Graph, step: number, time: number): void {
	const inBar = step % 16
	const chord = CHORDS[Math.floor(step / 16) % CHORDS.length]
	const swung = step % 2 === 1 ? time + SIXTEENTH * 0.33 : time
	if (inBar === 0) {
		playChord(graph, chord, time, SIXTEENTH * 16)
		playBass(graph, chord[0], time)
	}
	if (inBar === 10) playBass(graph, chord[0], time)
	if (KICKS.has(inBar)) playKick(graph, swung)
	if (SNARES.has(inBar))
		playNoiseHit(graph, swung, {
			type: 'bandpass',
			frequency: 1800,
			level: 0.28,
			length: 0.18
		})
	if (inBar % 2 === 0)
		playNoiseHit(graph, time, {
			type: 'highpass',
			frequency: 7000,
			level: 0.06,
			length: 0.05
		})
	if (Math.random() < 0.3)
		playNoiseHit(graph, time + Math.random() * SIXTEENTH, {
			type: 'highpass',
			frequency: 2500,
			level: 0.025,
			length: 0.012
		})
}

function fadeTo(graph: Graph, value: number): void {
	const now = graph.context.currentTime
	graph.master.gain.cancelScheduledValues(now)
	graph.master.gain.setValueAtTime(graph.master.gain.value, now)
	graph.master.gain.linearRampToValueAtTime(value, now + FADE)
}

export function createLofiRadio(
	makeContext: () => AudioContext = () => new AudioContext()
): LofiRadio {
	let graph: Graph | null = null
	let rain: AudioBufferSourceNode | null = null
	let fading: AudioBufferSourceNode | null = null
	let timer: number | undefined
	let step = 0
	let nextTime = 0
	let playing = false
	/** Bumped by every start/stop, so a start that resumed late knows it's stale. */
	let session = 0

	const tick = () => {
		if (!graph) return
		while (nextTime < graph.context.currentTime + LOOKAHEAD) {
			scheduleStep(graph, step, nextTime)
			nextTime += SIXTEENTH
			step = (step + 1) % 64
		}
	}

	// Stop every rain loop and the scheduler, so nothing keeps playing unowned
	const silence = () => {
		window.clearInterval(timer)
		timer = undefined
		rain?.stop()
		fading?.stop()
		rain = null
		fading = null
	}

	const stop = () => {
		if (!playing || !graph) return
		playing = false
		session += 1
		window.clearInterval(timer)
		timer = undefined
		fadeTo(graph, 0)
		fading?.stop()
		fading = rain
		rain = null
		const { context } = graph
		window.setTimeout(
			() => {
				if (playing) return
				fading?.stop()
				fading = null
				void context.suspend()
			},
			FADE * 1000 + 100
		)
	}

	return {
		start: async () => {
			if (playing) return
			// Claim the radio before awaiting, so a second tap can't start it twice
			playing = true
			session += 1
			const attempt = session
			try {
				graph ??= buildGraph(makeContext())
				await graph.context.resume()
			} catch (error) {
				// Only reset if no newer start/stop happened while resuming
				// eslint-disable-next-line require-atomic-updates -- guarded by the session check
				if (attempt === session) playing = false
				throw error
			}
			// Stopped (or restarted) while the context was resuming: stay silent
			if (attempt !== session) return
			silence()
			fadeTo(graph, VOLUME)
			rain = playRain(graph)
			step = 0
			nextTime = graph.context.currentTime + 0.05
			timer = window.setInterval(tick, TICK_MS)
		},
		stop,
		isPlaying: () => playing,
		dispose: () => {
			playing = false
			session += 1
			silence()
			void graph?.context.close()
			graph = null
		}
	}
}
