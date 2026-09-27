export type Ink = 'b' | 'p' | 'y'
export type Tri = readonly [number, number, number]

export const INKS: readonly Ink[] = ['y', 'p', 'b']

const INK_INDEX = { y: 0, p: 1, b: 2 } as const

export function hash(x: number, y: number, seed: number): number {
	let value =
		(Math.imul(x, 374_761_393) +
			Math.imul(y, 668_265_263) +
			Math.imul(seed, 1_442_695_041)) |
		0
	value = Math.imul(value ^ (value >>> 13), 1_274_126_177)
	return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296
}

export const clamp01 = (value: number): number =>
	Math.min(1, Math.max(0, value))

export const coverage = (value: number): string =>
	`rgba(0,0,0,${clamp01(value)})`

export function ease(value: number): number {
	const x = clamp01(value)
	return x * x * (3 - 2 * x)
}

export const mix = (a: Tri, b: Tri, factor: number): Tri => [
	a[0] + (b[0] - a[0]) * factor,
	a[1] + (b[1] - a[1]) * factor,
	a[2] + (b[2] - a[2]) * factor
]

export const scaleTri = (tri: Tri, factor: number, offset = 0): Tri => [
	tri[0] * factor + offset,
	tri[1] * factor + offset,
	tri[2] * factor + offset
]

export const pick = (ink: Ink, tri: Tri): number => tri[INK_INDEX[ink]]
