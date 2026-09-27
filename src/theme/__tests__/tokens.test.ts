import { readFileSync } from 'node:fs'
import path from 'node:path'
import { contrastRatio } from '../../lib/contrast'
import tokens from '../tokens.json'

// Vitest runs from the project root; import.meta.url is an http URL under jsdom
const css = readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8')
const lateShiftCss = readFileSync(
	path.resolve(process.cwd(), 'src/late-shift/lateShift.css'),
	'utf8'
)

describe('design tokens', () => {
	it.each(['light', 'dark'] as const)(
		'Quick Read %s text passes AA (4.5:1)',
		theme => {
			const palette = tokens.quick[theme]
			for (const colour of [palette.text, palette.muted, palette.link])
				expect(contrastRatio(colour, palette.bg)).toBeGreaterThanOrEqual(4.5)
		}
	)

	it.each(['light', 'dark'] as const)(
		'Quick Read %s focus ring passes 3:1',
		theme => {
			const palette = tokens.quick[theme]
			expect(contrastRatio(palette.focus, palette.bg)).toBeGreaterThanOrEqual(3)
		}
	)

	it('ink text on paper passes AA, focus ring passes 3:1', () => {
		expect(
			contrastRatio(tokens.ink.blue, tokens.ink.paper)
		).toBeGreaterThanOrEqual(4.5)
		expect(
			contrastRatio(tokens.ink.text, tokens.ink.paper)
		).toBeGreaterThanOrEqual(4.5)
		expect(
			contrastRatio(tokens.ink.focus, tokens.ink.paper)
		).toBeGreaterThanOrEqual(3)
	})

	it('keeps index.css variables in sync with tokens.json', () => {
		for (const [name, value] of Object.entries(tokens.quick.light))
			expect(css).toContain(`--quick-${name}: ${value};`)
		for (const [name, value] of Object.entries(tokens.quick.dark))
			expect(css).toContain(`--quick-${name}: ${value};`)
		expect(css).toContain(`--focus: ${tokens.ink.focus};`)
	})

	it('uses a yellow focus ring on the Late Shift dark surfaces (3:1)', () => {
		// The night backdrop behind chips/footer and the editor explorer
		for (const surface of ['#1d1c26', '#2e3a73'])
			expect(contrastRatio(tokens.ink.yellow, surface)).toBeGreaterThanOrEqual(
				3
			)
		expect(lateShiftCss).toMatch(
			/\.room-chip:focus-visible,\s*\.late-shift-footer a:focus-visible,\s*\.editor-tab:focus-visible\s*{\s*outline-color: var\(--ink-yellow\);/
		)
	})
})
