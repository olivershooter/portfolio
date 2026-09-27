import { hash, INKS, type Ink } from '../scene/math'
import { INK_HEX, MISREGISTRATION, PAPER_HEX } from '../scene/palette'

export interface Compositor {
	readonly resize: (cssWidth: number, cssHeight: number) => void
	readonly render: (
		time: number,
		viewport: { readonly vw: number; readonly vh: number },
		draw: (ink: Ink, g: CanvasRenderingContext2D) => void
	) => void
}

interface Plate {
	readonly ink: Ink
	readonly index: number
	readonly canvas: HTMLCanvasElement
	readonly g: CanvasRenderingContext2D
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const g = canvas.getContext('2d')
	if (!g) throw new Error('Canvas 2D is not available')
	// Safari < 16 and Firefox < 112 have no roundRect; the scene needs it
	if (typeof g.roundRect !== 'function')
		throw new Error('Canvas roundRect is not supported')
	return g
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	return canvas
}

/** Grain is a small repeating tile, so resizing never regenerates full-screen noise. */
const GRAIN_TILE = 256

function makeGrainTile(): HTMLCanvasElement {
	const canvas = makeCanvas(GRAIN_TILE, GRAIN_TILE)
	const g = context2d(canvas)
	const image = g.createImageData(GRAIN_TILE, GRAIN_TILE)
	const { data } = image
	for (let y = 0, index = 0; y < GRAIN_TILE; y += 1) {
		for (let x = 0; x < GRAIN_TILE; x += 1, index += 4) {
			const value = 255 - hash(x, y, 7) * 46 - hash(x >> 3, y >> 1, 9) * 14
			data[index] = value
			data[index + 1] = value
			data[index + 2] = value - 4
			data[index + 3] = 255
		}
	}
	g.putImageData(image, 0, 0)
	return canvas
}

export function createCompositor(
	canvas: HTMLCanvasElement,
	options: { readonly dpr: number; readonly grain: number }
): Compositor {
	const main = context2d(canvas)
	let width = 1
	let height = 1
	// Plates are created once and resized in place; iOS caps total canvas memory
	const plates: Plate[] = INKS.map((ink, index) => {
		const plate = makeCanvas(1, 1)
		return { ink, index, canvas: plate, g: context2d(plate) }
	})
	const grain = main.createPattern(makeGrainTile(), 'repeat')

	const resize = (cssWidth: number, cssHeight: number) => {
		const nextWidth = Math.max(1, Math.round(cssWidth * options.dpr))
		const nextHeight = Math.max(1, Math.round(cssHeight * options.dpr))
		if (nextWidth === width && nextHeight === height) return
		width = nextWidth
		height = nextHeight
		canvas.width = width
		canvas.height = height
		for (const plate of plates) {
			plate.canvas.width = width
			plate.canvas.height = height
		}
	}

	const render: Compositor['render'] = (time, viewport, draw) => {
		main.globalCompositeOperation = 'source-over'
		main.globalAlpha = 1
		main.fillStyle = PAPER_HEX
		main.fillRect(0, 0, width, height)
		const boil = Math.floor(time * 6)
		const shift = options.grain * options.dpr
		for (const { g, ink, index, canvas: plateCanvas } of plates) {
			g.setTransform(1, 0, 0, 1, 0, 0)
			g.globalCompositeOperation = 'source-over'
			g.clearRect(0, 0, width, height)
			const [ox, oy] = MISREGISTRATION[ink]
			g.translate(
				(ox + (hash(boil, index, 5) - 0.5) * 1.1) * shift,
				(oy + (hash(boil, index, 6) - 0.5) * 1.1) * shift
			)
			g.scale(width / viewport.vw, height / viewport.vh)
			draw(ink, g)
			g.setTransform(1, 0, 0, 1, 0, 0)
			g.globalCompositeOperation = 'source-in'
			g.fillStyle = INK_HEX[ink]
			g.fillRect(0, 0, width, height)
			main.globalCompositeOperation = 'multiply'
			main.drawImage(plateCanvas, 0, 0)
		}
		if (grain) {
			main.globalCompositeOperation = 'multiply'
			main.globalAlpha = 0.25 + 0.75 * options.grain
			main.fillStyle = grain
			main.fillRect(0, 0, width, height)
		}
		main.globalAlpha = 1
		main.globalCompositeOperation = 'source-over'
	}

	return { resize, render }
}
