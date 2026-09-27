/// <reference types="vitest" />
import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
	test: {
		css: false,
		include: ['src/**/__tests__/*'],
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		clearMocks: true,
		coverage: {
			include: [
				'src/lib/**/*.ts',
				'src/content/**/*.ts',
				'src/late-shift/sectionIds.ts',
				'src/late-shift/scene/math.ts',
				'src/late-shift/scene/timeOfDay.ts',
				'src/late-shift/scene/objects.ts',
				'src/late-shift/scene/layouts.ts',
				'src/late-shift/scene/hitTest.ts',
				'src/late-shift/scene/camera.ts',
				'src/late-shift/engine/loop.ts',
				'src/late-shift/ui/debugParameters.ts',
				'src/late-shift/ui/useScrollIntoPhone.ts'
			],
			exclude: ['**/__tests__/**'],
			thresholds: {
				'100': true
			},
			provider: 'istanbul',
			enabled: false,
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage'
		}
	},
	plugins: [
		tsconfigPaths(),
		react(),
		...(mode === 'test'
			? []
			: [
					eslintPlugin(),
					VitePWA({
						registerType: 'autoUpdate',
						includeAssets: ['favicon.png'],
						workbox: {
							// Images (~4 MB) load lazily on demand; precache only the app shell and Latin fonts
							globPatterns: ['**/*.{js,css,html}', 'assets/*-latin-*.woff2']
						}
					})
				])
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: { gsap: ['gsap'] }
			}
		}
	}
}))
