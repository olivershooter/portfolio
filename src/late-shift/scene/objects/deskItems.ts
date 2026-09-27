import { coverage, type Tri } from '../math'
import { knock, own } from '../paint'
import type { SceneFrame } from '../state'

export function drawRadio({ g, t, k, state }: SceneFrame): void {
	own(g, c => c.roundRect(150, 342, 152, 68, 7), k([0.35, 0.8, 0.22]))
	own(
		g,
		c => {
			c.rect(206, 332, 3, 12)
			c.rect(196, 330, 60, 3)
		},
		k([0.1, 0.4, 0.9])
	)
	for (let y = 354; y < 400; y += 6) {
		for (let x = 160; x < 196; x += 6)
			own(g, c => c.arc(x, y, 1.6, 0, 7), k([0.2, 0.5, 0.95]))
	}
	own(g, c => c.roundRect(204, 352, 88, 36, 4), k([0.08, 0.08, 0.25]))
	for (const cx of [228, 268]) {
		own(g, c => c.arc(cx, 370, 11, 0, 7), k([0.1, 0.35, 0.9]))
		for (let spoke = 0; spoke < 3; spoke += 1) {
			const angle = state.reelAngle + spoke * 2.094
			knock(
				g,
				c => {
					c.lineWidth = 2.5
					c.beginPath()
					c.moveTo(cx, 370)
					c.lineTo(cx + Math.cos(angle) * 9, 370 + Math.sin(angle) * 9)
					c.stroke()
				},
				1
			)
		}
	}
	g.font = '700 8px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0, 0.1, 0.95]))
	g.fillText(state.radioOn ? 'LOFI FM  ▶' : 'LOFI FM  ■', 216, 402)
	if (!state.radioOn) return
	for (let index = 0; index < 4; index += 1) {
		const life = (t * 0.5 + index * 0.25) % 1
		g.font = `700 ${12 + index * 2}px system-ui`
		g.fillStyle = coverage(k([0, 0.8, 0.9]) * (1 - life))
		g.fillText(
			index % 2 === 1 ? '♪' : '♫',
			250 + Math.sin(life * 6 + index) * 18 + index * 8,
			336 - life * 62
		)
	}
}

export function drawMug({ g, t, k }: SceneFrame): void {
	own(g, c => c.roundRect(334, 376, 30, 34, 3), k([0.1, 0.25, 0.9]))
	g.lineWidth = 4
	g.strokeStyle = coverage(k([0.1, 0.25, 0.9]))
	g.beginPath()
	g.arc(365, 392, 7, -1.4, 1.4)
	g.stroke()
	for (let wisp = 0; wisp < 2; wisp += 1) {
		knock(
			g,
			c => {
				c.lineWidth = 3
				c.beginPath()
				c.moveTo(342 + wisp * 12 + Math.sin(t * 3.2 + wisp * 2) * 4, 372)
				for (let y = 2; y < 38; y += 2) {
					c.lineTo(
						342 + wisp * 12 + Math.sin(y * 0.2 + t * 3.2 + wisp * 2) * 4,
						372 - y
					)
				}
				c.stroke()
			},
			0.45
		)
	}
}

interface Book {
	readonly x: number
	readonly y: number
	readonly w: number
	readonly colour: Tri
	readonly title: string
}

const BOOKS: readonly Book[] = [
	{ x: 392, y: 396, w: 58, colour: [0.1, 0.85, 0.1], title: 'KOTLIN' },
	{ x: 396, y: 382, w: 52, colour: [0.9, 0.05, 0.2], title: 'REACT' },
	{ x: 390, y: 368, w: 56, colour: [0.05, 0.25, 0.9], title: 'K8S · HELM' }
]

export function drawBooks({ g, k }: SceneFrame): void {
	for (const book of BOOKS) {
		own(g, c => c.roundRect(book.x, book.y, book.w, 14, 2), k(book.colour))
		g.font = '700 6.5px "JetBrains Mono", monospace'
		g.fillStyle = coverage(
			k(book.colour[2] > 0.5 ? [0.9, 0, 0] : [0, 0.1, 0.95])
		)
		g.fillText(book.title, book.x + 5, book.y + 9.5)
	}
}

export function drawLamp({ g, k }: SceneFrame): void {
	g.lineWidth = 4
	g.strokeStyle = coverage(k([0, 0.45, 1]))
	g.beginPath()
	g.moveTo(950, 408)
	g.lineTo(930, 350)
	g.lineTo(912, 300)
	g.stroke()
	own(
		g,
		c => {
			c.moveTo(880, 312)
			c.lineTo(896, 280)
			c.lineTo(922, 280)
			c.lineTo(934, 312)
			c.closePath()
		},
		k([0.1, 0.6, 0.95])
	)
	own(g, c => c.ellipse(907, 313, 26, 4, 0, 0, 7), k([1, 0.1, 0]))
	own(g, c => c.rect(934, 404, 32, 6), k([0.05, 0.5, 1]))
}
