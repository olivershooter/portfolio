import { clamp01, mix, type Tri } from './math'

export type TodName = 'dawn' | 'day' | 'dusk' | 'night'
export type TodMode = TodName | 'auto'

export interface TodState {
	readonly skyT: Tri
	readonly skyB: Tri
	readonly wall: Tri
	readonly sil: Tri
	readonly lamp: number
	readonly lit: number
	readonly n: number
}

export const TOD: Readonly<Record<TodName, TodState>> = {
	dawn: {
		skyT: [0.1, 0.5, 0.4],
		skyB: [0.6, 0.45, 0.02],
		wall: [0, 0.32, 0.42],
		sil: [0.05, 0.4, 0.75],
		lamp: 0.45,
		lit: 0.5,
		n: 0.3
	},
	day: {
		skyT: [0.05, 0.1, 0.32],
		skyB: [0.1, 0.08, 0.12],
		wall: [0.08, 0.16, 0.2],
		sil: [0.12, 0.3, 0.55],
		lamp: 0.1,
		lit: 0,
		n: 0
	},
	dusk: {
		skyT: [0.3, 0.6, 0.4],
		skyB: [0.95, 0.5, 0],
		wall: [0, 0.38, 0.55],
		sil: [0.08, 0.5, 0.85],
		lamp: 0.6,
		lit: 0.7,
		n: 0.5
	},
	night: {
		skyT: [0, 0.35, 1],
		skyB: [0, 0.5, 0.8],
		wall: [0, 0.3, 0.82],
		sil: [0.03, 0.45, 1],
		lamp: 0.85,
		lit: 1,
		n: 1
	}
}

export function autoTod(date: Date): TodName {
	const hour = date.getHours()
	if (hour >= 5 && hour < 8) return 'dawn'
	if (hour >= 8 && hour < 17) return 'day'
	if (hour >= 17 && hour < 20) return 'dusk'
	return 'night'
}

export const resolveTod = (mode: TodMode, date: Date): TodName =>
	mode === 'auto' ? autoTod(date) : mode

export function approachTod(
	current: TodState,
	target: TodState,
	factor: number
): TodState {
	const f = clamp01(factor)
	if (f === 0) return current
	if (f === 1) return target
	const lerp = (a: number, b: number) => a + (b - a) * f
	return {
		skyT: mix(current.skyT, target.skyT, f),
		skyB: mix(current.skyB, target.skyB, f),
		wall: mix(current.wall, target.wall, f),
		sil: mix(current.sil, target.sil, f),
		lamp: lerp(current.lamp, target.lamp),
		lit: lerp(current.lit, target.lit),
		n: lerp(current.n, target.n)
	}
}
