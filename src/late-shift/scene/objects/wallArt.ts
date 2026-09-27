import { coverage, type Tri } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

const POSTER: Tri = [0.15, 0.85, 0.25]

export function drawPoster({ g, t, k }: SceneFrame): void {
	own(g, c => c.rect(512, 66, 88, 132), k(POSTER))
	own(g, c => c.arc(556, 118, 30, 0, 7), k([0.9, 0.2, 0]))
	for (let index = 0; index < 6; index += 1) {
		const angle = index * 1.047 + t * 0.5
		own(
			g,
			c =>
				c.arc(556 + Math.cos(angle) * 17, 118 + Math.sin(angle) * 17, 6, 0, 7),
			k(POSTER)
		)
	}
	own(g, c => c.arc(556, 118, 5, 0, 7), k(POSTER))
	g.fillStyle = coverage(k([0.9, 0, 0]))
	g.font = '400 12px "Archivo Black", system-ui'
	g.fillText('SCREENDLE', 517, 176)
	g.font = '700 7px "JetBrains Mono", monospace'
	g.fillText('5 CLUES · 5 GUESSES', 520, 188)
}

interface Note {
	readonly x: number
	readonly y: number
	readonly tilt: number
	readonly colour: Tri
	readonly word: string
}

const NOTES: readonly Note[] = [
	{ x: 630, y: 86, tilt: -0.08, colour: [0.9, 0.05, 0], word: 'hola' },
	{ x: 680, y: 100, tilt: 0.07, colour: [0.2, 0.75, 0], word: 'merci' },
	{ x: 646, y: 134, tilt: 0.04, colour: [0.08, 0.1, 0.35], word: 'سلام' },
	{ x: 700, y: 146, tilt: -0.05, colour: [0.9, 0.05, 0], word: 'ciao' }
]

export function drawStickies({ g, t, k }: SceneFrame): void {
	for (const note of NOTES) {
		g.save()
		g.translate(note.x + 20, note.y + 20)
		g.rotate(note.tilt + Math.sin(t * 1.4 + note.x) * 0.02)
		own(g, c => c.rect(-20, -20, 40, 40), k(note.colour))
		g.font = '700 11px "DM Sans", system-ui'
		g.textAlign = 'center'
		g.fillStyle = coverage(k([0, 0.1, 0.95]))
		g.fillText(note.word, 0, 4)
		g.restore()
	}
}
