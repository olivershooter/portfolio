import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const size = (file: string) => statSync(path.resolve(root, file)).size
const html = readFileSync(path.resolve(root, 'index.html'), 'utf8')

// The icon downloads on every page: on slow mobile it competed with the Late Shift's code
describe('site icons', () => {
	it('keeps every icon small', () => {
		expect(size('public/favicon.svg')).toBeLessThan(2000)
		expect(size('public/favicon.png')).toBeLessThan(10_000)
		expect(size('public/apple-touch-icon.png')).toBeLessThan(30_000)
	})

	it('links the SVG icon with PNG fallbacks', () => {
		expect(html).toContain(
			'<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'
		)
		expect(html).toContain(
			'<link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />'
		)
		expect(html).toContain(
			'<link rel="apple-touch-icon" href="/apple-touch-icon.png" />'
		)
	})
})

