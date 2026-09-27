import { coverage, ease, type Ink, type Tri } from '../math'
import { knock, own, verticalGradient } from '../paint'
import type { SceneFrame } from '../state'

const SX = 745
const SY = 305
const SW = 52
const SH = 98
const PRAYERS = [
	['Fajr', '05:31'],
	['Dhuhr', '13:02'],
	['Asr', '16:12'],
	['Maghrib', '18:52'],
	['Isha', '20:21']
] as const

function drawPrayerScreen(
	g: CanvasRenderingContext2D,
	k: (tri: Tri) => number,
	fade: number,
	isNight: boolean
): void {
	const write = (text: string, x: number, y: number, size: number) => {
		g.font = `700 ${size}px "DM Sans", system-ui`
		if (isNight) {
			knock(g, c => c.fillText(text, x, y), fade)
			return
		}
		g.fillStyle = coverage(k([0, 0.1, 0.95]) * fade)
		g.fillText(text, x, y)
	}
	write('Manchester', SX + 5, SY + 11, 4.5)
	write('Maghrib 18:52', SX + 5, SY + 27, 7.5)
	write('in 1h 04m', SX + 5, SY + 35, 4.5)
	for (const [index, [name, time]] of PRAYERS.entries()) {
		own(
			g,
			c => c.roundRect(SX + 4, SY + 44 + index * 10, SW - 8, 8, 2),
			(index === 3 ? k([0.9, 0.3, 0]) : k([0.05, 0.05, 0.12])) * fade
		)
		g.font = '600 4px "DM Sans", system-ui'
		g.fillStyle = coverage(k([0, 0.1, 0.9]) * fade)
		g.fillText(name, SX + 7, SY + 49.5 + index * 10)
		g.fillText(time, SX + SW - 18, SY + 49.5 + index * 10)
	}
}

function drawAndroidTitle(
	g: CanvasRenderingContext2D,
	ink: Ink,
	k: (tri: Tri) => number,
	printed: number
): void {
	const slide = (1 - printed) * 14
	g.font = '400 10px "Archivo Black", system-ui'
	const size = (10 * (SW - 7)) / g.measureText('ANDROID').width
	g.font = `400 ${size}px "Archivo Black", system-ui`
	if (ink === 'p') {
		g.fillStyle = coverage(0.95 * (0.3 + 0.7 * printed))
		g.fillText('ANDROID', SX + 3 - slide, SY + 34 - slide * 0.3)
	}
	if (ink === 'b') {
		g.fillStyle = coverage(0.8 * (0.3 + 0.7 * printed))
		g.fillText('ANDROID', SX + 3 + slide, SY + 34 + slide * 0.3)
	}
	if (ink === 'y') {
		g.fillStyle = coverage(0.9 * printed)
		g.beginPath()
		g.arc(SX + SW - 10, SY + SH - 12, 7, 0, 7)
		g.fill()
	}
	g.font = '700 3.6px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0, 0.2, 0.95]) * printed)
	g.fillText('02 / KOTLIN · COMPOSE', SX + 4, SY + 16)
}

export default function drawPhone({ g, ink, k, state }: SceneFrame): void {
	const { tod, phoneReveal } = state
	own(
		g,
		c => {
			c.moveTo(752, 410)
			c.lineTo(768, 380)
			c.lineTo(790, 410)
			c.closePath()
		},
		k([0.1, 0.4, 0.9])
	)
	own(g, c => c.roundRect(741, 300, 60, 108, 9), k([0.05, 0.3, 1]))
	const fade = 1 - ease((phoneReveal - 0.45) / 0.18)
	g.save()
	g.beginPath()
	g.roundRect(SX, SY, SW, SH, 5)
	g.clip()
	own(
		g,
		c => c.rect(SX, SY, SW, SH),
		c =>
			verticalGradient(
				c,
				[SY, SY + SH],
				[k(tod.skyT) * fade, k(tod.skyB) * fade]
			)
	)
	if (fade > 0.01) drawPrayerScreen(g, k, fade, tod.n > 0.4)
	const printed = ease((phoneReveal - 0.6) / 0.3)
	if (printed > 0) drawAndroidTitle(g, ink, k, printed)
	g.restore()
}
