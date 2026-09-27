import { coverage } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

const FOOTBALL_PATCHES = [
	[-12, -8],
	[13, -7],
	[-7, 12],
	[9, 11]
] as const

export function drawShelf({ g, t, k }: SceneFrame): void {
	own(g, c => c.rect(770, 206, 212, 8), k([0.3, 0.6, 0.6]))
	own(
		g,
		c => {
			c.moveTo(938, 206)
			c.lineTo(942, 184)
			c.lineTo(966, 184)
			c.lineTo(970, 206)
			c.closePath()
		},
		k([0.5, 0.75, 0.3])
	)
	for (let index = 0; index < 5; index += 1) {
		const angle = -2.4 + index * 0.45 + Math.sin(t * 1.3 + index) * 0.06
		own(
			g,
			c =>
				c.ellipse(
					954 + Math.cos(angle) * 14,
					180 + Math.sin(angle) * 14,
					12,
					5,
					angle,
					0,
					7
				),
			k([0.75, 0.05, 0.65])
		)
	}
}

export function drawCamera({ g, k }: SceneFrame): void {
	own(
		g,
		c => {
			c.roundRect(786, 166, 58, 40, 4)
			c.rect(800, 152, 26, 14)
		},
		k([0.1, 0.35, 0.95])
	)
	own(g, c => c.arc(852, 186, 13, 0, 7), k([0.2, 0.15, 0.6]))
	own(g, c => c.arc(852, 186, 6, 0, 7), k([0.9, 0.1, 0.2]))
	g.font = '700 7px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0.8, 0.1, 0]))
	g.fillText('SUPER 8', 792, 200)
}

export function drawFootball({ g, t, k }: SceneFrame): void {
	g.save()
	g.translate(898, 189)
	g.rotate(Math.sin(t * 0.8) * 0.15)
	own(g, c => c.arc(0, 0, 17, 0, 7), k([0.04, 0.04, 0.08]))
	own(
		g,
		c => {
			c.arc(0, 0, 5.5, 0, 7)
			for (const [x, y] of FOOTBALL_PATCHES) {
				c.moveTo(x + 3.5, y)
				c.arc(x, y, 3.5, 0, 7)
			}
		},
		k([0, 0.2, 0.95])
	)
	g.restore()
}
