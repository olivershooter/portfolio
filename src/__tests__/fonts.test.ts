import { readFileSync } from 'node:fs'
import path from 'node:path'
import inlineAssets from '../build/inlineAssets'

const root = process.cwd()

// Fonts inlined as base64 made the render-blocking stylesheet ~18 KB heavier
describe('fonts', () => {
	it('loads only the Latin subsets', () => {
		const main = readFileSync(path.resolve(root, 'src/main.tsx'), 'utf8')
		const imports = [...main.matchAll(/'@fontsource\/[^']+'/g)].map(
			([spec]) => spec
		)
		expect(imports.length).toBeGreaterThan(0)
		for (const spec of imports) expect(spec).toMatch(/\/latin-\d{3}\.css'$/)
	})

	it('never inlines font files into the CSS', () => {
		expect(inlineAssets('font.woff2')).toBe(false)
		expect(inlineAssets('font.woff')).toBe(false)
		expect(inlineAssets('icon.svg')).toBeUndefined()
	})
})
