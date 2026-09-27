import { coverage, hash, mix, scaleTri, type Tri } from '../math'
import { knock, own, verticalGradient } from '../paint'
import type { SceneFrame } from '../state'

const WX = 70
const WY = 50
const WW = 400
const WH = 290
const WB = WY + WH
const FRAME: Tri = [0.25, 0.55, 0.85]

function drawSky({ g, t, k, state }: SceneFrame): void {
	const { tod } = state
	own(
		g,
		c => c.rect(WX, WY, WW, WH),
		c => verticalGradient(c, [WY, WB], [k(tod.skyT), k(tod.skyB)])
	)
	if (tod.n > 0.3) {
		for (let index = 0; index < 22; index += 1) {
			if (Math.sin(t * 2.5 + index * 3) > -0.2) {
				own(
					g,
					c =>
						c.rect(
							WX + hash(index, 1, 2) * WW,
							WY + hash(index, 2, 2) * WH * 0.5,
							2,
							2
						),
					k([0.7, 0, 0]) * tod.n
				)
			}
		}
		own(g, c => c.arc(WX + 62, WY + 46, 15, 0, 7), k([0.85, 0.05, 0]))
	}
	for (let index = 0; index < 4; index += 1) {
		const cx = WX + ((index * 140 + t * 12) % (WW + 160)) - 80
		const cy = WY + 40 + index * 22
		own(
			g,
			c => {
				c.ellipse(cx, cy, 60, 12, 0, 0, 7)
				c.ellipse(cx + 26, cy - 8, 34, 11, 0, 0, 7)
			},
			k(mix(tod.skyT, [0.05, 0.12, 0.3], 0.5))
		)
	}
}

function drawSkyline({ g, t, k, state }: SceneFrame): void {
	const { tod } = state
	const { sil, n, lit } = tod
	own(
		g,
		c => {
			c.moveTo(WX, WB)
			for (let x = 0; x <= WW; x += 24) {
				const roof = 44 + hash(x, 3, 3) * 18
				c.lineTo(WX + x, WB - roof + 10)
				c.lineTo(WX + x + 12, WB - roof)
				c.lineTo(WX + x + 24, WB - roof + 10)
			}
			c.lineTo(WX + WW, WB)
			c.closePath()
		},
		k(scaleTri(sil, 0.88))
	)
	const brick = mix([0.35, 0.75, 0.4], [0.05, 0.55, 1], n * 0.85)
	own(
		g,
		c => {
			c.rect(96, 246, 128, WB - 246)
			c.rect(200, 160, 14, 90)
			c.rect(197, 156, 20, 8)
		},
		k(brick)
	)
	for (let row = 0; row < 3; row += 1) {
		for (let column = 0; column < 6; column += 1) {
			const isLit = hash(column, row, 9) < 0.55 && lit > 0.2
			own(
				g,
				c => c.rect(104 + column * 20, 256 + row * 24, 10, 14),
				isLit ? k([lit, 0.15, 0]) : k(scaleTri(brick, 0.75, 0.15))
			)
		}
	}
	const glass = mix([0.05, 0.12, 0.5], sil, n)
	own(
		g,
		c => {
			c.rect(352, 92, 26, WB - 92)
			c.rect(352, 92, 34, 96)
			c.rect(382, 74, 2, 20)
		},
		k(glass)
	)
	for (let y = 100; y < WB; y += 9) {
		const isLit = n > 0.3 && hash(y, 1, 4) < 0.6
		own(
			g,
			c => c.rect(354, y, y < 188 ? 30 : 22, 1.6),
			isLit ? k([lit * 0.9, 0, 0]) : k(scaleTri(glass, 0.7, 0.15))
		)
	}
	g.lineWidth = 1.2
	g.strokeStyle = coverage(k([0, 0.4, 0.8]))
	g.beginPath()
	g.moveTo(WX, WB - 42)
	g.lineTo(WX + WW, WB - 40)
	g.stroke()
	const tramX = WX + WW + 60 - ((t * 120) % (WW + 460))
	own(g, c => c.roundRect(tramX, WB - 30, 200, 22, 5), k([1, 0.12, 0.08]))
	g.lineWidth = 1.5
	g.strokeStyle = coverage(k([0, 0.3, 0.9]))
	g.beginPath()
	g.moveTo(tramX + 90, WB - 30)
	g.lineTo(tramX + 100, WB - 41)
	g.lineTo(tramX + 110, WB - 30)
	g.stroke()
	for (let index = 0; index < 9; index += 1) {
		own(
			g,
			c => c.rect(tramX + 8 + index * 21, WB - 26, 14, 8),
			n > 0.3 ? k([1, 0, 0]) : k([0.1, 0.3, 0.75])
		)
	}
	own(g, c => c.rect(WX, WB - 8, WW, 8), k(scaleTri(sil, 0.8)))
}

function drawRain({ g, t, state }: SceneFrame): void {
	const { n } = state.tod
	const streaks = state.isLightRain ? 23 : 46
	for (let index = 0; index < streaks; index += 1) {
		const rx = WX + hash(index, 4, 1) * (WW + 40)
		const ry = WY + ((hash(index, 5, 1) * WH + t * 260) % (WH + 20)) - 10
		knock(
			g,
			c => {
				c.lineWidth = 1.2
				c.beginPath()
				c.moveTo(rx, ry)
				c.lineTo(rx - 5, ry + 13)
				c.stroke()
			},
			0.35 + 0.35 * n
		)
	}
	for (let index = 0; index < 16; index += 1) {
		const dx = WX + hash(index, 8, 8) * WW
		const dy =
			WY + ((hash(index, 9, 8) * WH + t * (8 + hash(index, 1, 8) * 14)) % WH)
		knock(
			g,
			c => {
				c.beginPath()
				c.arc(dx, dy, 2.4, 0, 7)
				c.fill()
			},
			0.45
		)
	}
}

export default function drawWindow(frame: SceneFrame): void {
	const { g, k } = frame
	g.save()
	g.beginPath()
	g.rect(WX, WY, WW, WH)
	g.clip()
	drawSky(frame)
	drawSkyline(frame)
	drawRain(frame)
	g.restore()
	own(
		g,
		c => {
			c.rect(WX + WW / 2 - 3, WY, 6, WH)
			c.rect(WX, WY + WH * 0.45 - 3, WW, 6)
		},
		k(FRAME)
	)
	g.lineWidth = 9
	g.strokeStyle = coverage(k(FRAME))
	g.strokeRect(WX - 2, WY - 2, WW + 4, WH + 4)
	own(g, c => c.rect(WX - 16, WB + 4, WW + 32, 12), k([0.3, 0.55, 0.6]))
}
