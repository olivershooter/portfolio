/** Vite `assetsInlineLimit`: never inline fonts as base64, or they bloat the render-blocking stylesheet. */
export default function inlineAssets(file: string): false | undefined {
	return /\.woff2?$/.test(file) ? false : undefined
}
