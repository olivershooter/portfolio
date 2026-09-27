import tokens from './src/theme/tokens.json'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				paper: tokens.ink.paper,
				ink: {
					blue: tokens.ink.blue,
					pink: tokens.ink.pink,
					yellow: tokens.ink.yellow,
					text: tokens.ink.text,
					focus: tokens.ink.focus
				},
				quick: {
					bg: 'var(--quick-bg)',
					text: 'var(--quick-text)',
					muted: 'var(--quick-muted)',
					link: 'var(--quick-link)',
					rule: 'var(--quick-rule)',
					focus: 'var(--quick-focus)'
				}
			},
			fontFamily: {
				display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
				body: ['"DM Sans"', 'system-ui', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
			}
		}
	},
	plugins: []
}
