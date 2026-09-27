const HEX = /^#[\da-f]{6}$/i

function channel(hexPair: string): number {
	const value = Number.parseInt(hexPair, 16) / 255
	return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
	if (!HEX.test(hex)) throw new Error(`Invalid hex colour: ${hex}`)
	const red = channel(hex.slice(1, 3))
	const green = channel(hex.slice(3, 5))
	const blue = channel(hex.slice(5, 7))
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(foreground: string, background: string): number {
	const [light, dark] = [
		relativeLuminance(foreground),
		relativeLuminance(background)
	].sort((a, b) => b - a)
	return (light + 0.05) / (dark + 0.05)
}
