import { coverage } from './math'

export type DrawPath = (g: CanvasRenderingContext2D) => void
export type Fill = number | ((g: CanvasRenderingContext2D) => CanvasGradient)

/** Clear the shape on this plate, then lay it down at `fill` coverage, so the shape owns its value. */
export function own(
	g: CanvasRenderingContext2D,
	path: DrawPath,
	fill: Fill
): void {
	g.save()
	g.beginPath()
	path(g)
	g.globalCompositeOperation = 'destination-out'
	g.fillStyle = '#000'
	g.fill()
	g.globalCompositeOperation = 'source-over'
	g.fillStyle = typeof fill === 'number' ? coverage(fill) : fill(g)
	g.fill()
	g.restore()
}

/** Remove ink (rain, steam, stars): paper shows through. */
export function knock(
	g: CanvasRenderingContext2D,
	draw: DrawPath,
	amount: number
): void {
	g.save()
	g.globalCompositeOperation = 'destination-out'
	const style = coverage(amount)
	g.strokeStyle = style
	g.fillStyle = style
	draw(g)
	g.restore()
}

export function verticalGradient(
	g: CanvasRenderingContext2D,
	span: readonly [number, number],
	stops: readonly [number, number]
): CanvasGradient {
	const gradient = g.createLinearGradient(0, span[0], 0, span[1])
	gradient.addColorStop(0, coverage(stops[0]))
	gradient.addColorStop(1, coverage(stops[1]))
	return gradient
}

export function radialGlow(
	g: CanvasRenderingContext2D,
	centre: readonly [number, number],
	radius: number,
	alpha: number
): CanvasGradient {
	const gradient = g.createRadialGradient(
		centre[0],
		centre[1],
		4,
		centre[0],
		centre[1],
		radius
	)
	gradient.addColorStop(0, coverage(alpha))
	gradient.addColorStop(1, coverage(0))
	return gradient
}
