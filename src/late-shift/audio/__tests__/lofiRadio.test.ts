import { createLofiRadio } from '../lofiRadio'

function fakeParameter() {
	return {
		value: 0,
		setValueAtTime: vi.fn(),
		linearRampToValueAtTime: vi.fn(),
		exponentialRampToValueAtTime: vi.fn(),
		cancelScheduledValues: vi.fn()
	}
}

function fakeNode() {
	return {
		connect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
		addEventListener: vi.fn(),
		gain: fakeParameter(),
		frequency: fakeParameter(),
		Q: fakeParameter(),
		type: '',
		buffer: null as unknown,
		loop: false
	}
}

function fakeContext(resume: () => Promise<void>) {
	const sources: ReturnType<typeof fakeNode>[] = []
	const context = {
		currentTime: 0,
		sampleRate: 8,
		destination: {},
		resume: vi.fn(resume),
		suspend: vi.fn(async () => {}),
		close: vi.fn(async () => {}),
		createGain: fakeNode,
		createBiquadFilter: fakeNode,
		createOscillator: fakeNode,
		createBuffer: () => ({ getChannelData: () => new Float32Array(16) }),
		createBufferSource: () => {
			const node = fakeNode()
			sources.push(node)
			return node
		}
	}
	return { context: context as unknown as AudioContext, raw: context, sources }
}

describe('LOFI FM radio', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('does not start playing if stopped while the audio context is resuming', async () => {
		vi.useFakeTimers()
		let finishResume: (() => void) | undefined
		const fake = fakeContext(
			async () =>
				new Promise<void>(resolve => {
					finishResume = resolve
				})
		)
		const radio = createLofiRadio(() => fake.context)
		const starting = radio.start()
		radio.stop()
		finishResume?.()
		await starting
		expect(radio.isPlaying()).toBe(false)
		expect(fake.sources.filter(source => source.loop)).toHaveLength(0)
	})

	it('keeps only one rain loop across repeated starts and stops', async () => {
		vi.useFakeTimers()
		const fake = fakeContext(async () => {})
		const radio = createLofiRadio(() => fake.context)
		await radio.start()
		radio.stop()
		await radio.start()
		const loops = fake.sources.filter(source => source.loop)
		expect(loops).toHaveLength(2)
		expect(loops[0].stop).toHaveBeenCalled()
	})

	it('is not playing when the audio context cannot resume', async () => {
		const fake = fakeContext(async () => {
			throw new Error('blocked')
		})
		const radio = createLofiRadio(() => fake.context)
		await expect(radio.start()).rejects.toThrow('blocked')
		expect(radio.isPlaying()).toBe(false)
	})

	it('closes the audio context when disposed', async () => {
		const fake = fakeContext(async () => {})
		const radio = createLofiRadio(() => fake.context)
		await radio.start()
		radio.dispose()
		expect(fake.raw.close).toHaveBeenCalled()
		expect(radio.isPlaying()).toBe(false)
	})
})
