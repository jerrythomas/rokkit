import palette from './palette.json'
import { PATTERN_ORDER } from './brewing/patterns.js'
import { shapes } from '../symbols'

export const swatch = {
	palette,
	keys: {
		gray: ['gray'],
		color: Object.keys(palette).filter((name) => name !== 'gray'),
		symbol: shapes,
		pattern: PATTERN_ORDER
	}
}
