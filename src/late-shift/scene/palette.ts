import tokens from '../../theme/tokens.json'
import type { Ink } from './math'

export const INK_HEX: Readonly<Record<Ink, string>> = {
	y: tokens.ink.yellow,
	p: tokens.ink.pink,
	b: tokens.ink.blue
}

export const PAPER_HEX = tokens.ink.paper

export const MISREGISTRATION: Readonly<Record<Ink, readonly [number, number]>> =
	{
		y: [0, 0],
		p: [1.3, -0.8],
		b: [-1, 1.2]
	}

export const GRAIN = 0.12
