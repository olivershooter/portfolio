/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#E8FF47',
				'primary-dark': '#C8DF27',
				bg: '#0A0A0A',
				surface: '#131313',
				'surface-high': '#1E1E1E',
				'surface-highest': '#262626',
				'text-base': '#F0F0F0',
				'text-muted': '#666666',
				outline: '#2A2A2A'
			},
			fontFamily: {
				headline: ['Syne', 'sans-serif'],
				body: ['DM Sans', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			borderRadius: {
				DEFAULT: '0px',
				none: '0px',
				full: '9999px'
			}
		}
	},
	safelist: ['col-span-1', 'col-span-2'],
	plugins: []
}
