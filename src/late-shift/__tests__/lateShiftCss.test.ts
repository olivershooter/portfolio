import { readFileSync } from 'node:fs'
import path from 'node:path'

// Layout rules jsdom can't compute, pinned against the stylesheet itself
const css = readFileSync(
	path.resolve(process.cwd(), 'src/late-shift/lateShift.css'),
	'utf8'
).replaceAll('\r\n', '\n')

describe('Late Shift stylesheet', () => {
	it('cross-fades section pages over 200 ms with reduced motion', () => {
		expect(css).toMatch(
			/@media \(prefers-reduced-motion: reduce\) {[^@]*\.late-shift \.section-page {\s*animation-duration: 0\.2s !important;/
		)
	})

	it('stacks the film strip vertically on phones', () => {
		expect(css).toMatch(
			/@media \(width < 700px\) {[^@]*\.film-strip ol {\s*flex-direction: column;/
		)
	})

	it('moves the hint away from the Contact tag on narrower stages', () => {
		expect(css).toMatch(/\.room-stage {[^}]*container-type: inline-size;/)
		expect(css).toMatch(
			/@container \(width < 980px\) {\s*\.room-hint {\s*top: auto;\s*bottom: 12px;/
		)
	})
})
