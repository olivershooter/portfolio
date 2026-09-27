import { createCompositor } from '../compositor'

function fakeContext() {
	return {
		roundRect: vi.fn(),
		createImageData: (width: number, height: number) => ({
			data: new Uint8ClampedArray(width * height * 4)
		}),
		putImageData: vi.fn(),
		createPattern: vi.fn(() => ({})),
		fillRect: vi.fn(),
		drawImage: vi.fn()
	}
}

function fakeCanvas() {
	return { width: 0, height: 0, getContext: vi.fn(fakeContext) }
}

describe('createCompositor', () => {
	it('refuses a canvas without roundRect so the room can fall back', () => {
		const canvas = {
			getContext: () => ({})
		} as unknown as HTMLCanvasElement
		expect(() => createCompositor(canvas, { dpr: 1, grain: 0.12 })).toThrow(
			/roundRect/
		)
	})

	it('reuses its canvases and a small grain tile across resizes', () => {
		const created: ReturnType<typeof fakeCanvas>[] = []
		const createElement = vi
			.spyOn(document, 'createElement')
			.mockImplementation(() => {
				const canvas = fakeCanvas()
				created.push(canvas)
				return canvas as unknown as HTMLElement
			})
		const main = fakeCanvas()
		const compositor = createCompositor(main as unknown as HTMLCanvasElement, {
			dpr: 2,
			grain: 0.12
		})
		compositor.resize(1000, 560)
		const afterFirst = created.length
		compositor.resize(800, 448)
		compositor.resize(800, 448)
		expect(created).toHaveLength(afterFirst)
		expect(main.width).toBe(1600)
		expect(Math.max(...created.map(canvas => canvas.width))).toBe(1600)
		expect(
			Math.min(...created.map(canvas => canvas.width))
		).toBeLessThanOrEqual(256)
		createElement.mockRestore()
	})
})
