import type { Tri } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

type Token = 'call' | 'keyword' | 'plain' | 'string'

const COLOURS: Readonly<Record<Token, Tri>> = {
	keyword: [0, 0.9, 0],
	string: [0.95, 0, 0],
	call: [0.85, 0, 0],
	plain: [0.12, 0.08, 0.05]
}

const LINES: readonly (readonly [number, Token, number])[] = [
	[0, 'keyword', 36],
	[0, 'string', 70],
	[1, 'plain', 90],
	[2, 'keyword', 30],
	[2, 'call', 60],
	[1, 'plain', 40],
	[3, 'string', 80],
	[3, 'call', 44],
	[2, 'plain', 70],
	[1, 'keyword', 26],
	[0, 'plain', 12],
	[0, 'keyword', 50],
	[1, 'call', 96],
	[2, 'string', 54]
]

export default function drawLaptop({ g, t, k }: SceneFrame): void {
	own(g, c => c.roundRect(484, 250, 216, 146, 6), k([0.05, 0.35, 1]))
	own(g, c => c.rect(492, 258, 200, 130), k([0.02, 0.3, 0.8]))
	const offset = Math.floor(t * 1.2) % LINES.length
	for (let index = 0; index < 12; index += 1) {
		const [indent, token, width] = LINES[(index + offset) % LINES.length]
		own(
			g,
			c => c.rect(500 + indent * 12, 266 + index * 10, width, 4),
			k(COLOURS[token])
		)
	}
	if (Math.floor(t * 2.5) % 2 === 1)
		own(g, c => c.rect(610, 376, 5, 6), k([0.95, 0, 0]))
	own(
		g,
		c => {
			c.moveTo(470, 396)
			c.lineTo(714, 396)
			c.lineTo(728, 412)
			c.lineTo(456, 412)
			c.closePath()
		},
		k([0.08, 0.4, 0.8])
	)
}
