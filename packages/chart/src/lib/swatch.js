import { writable } from 'svelte/store'
import palette from './palette.json'
// skipcq: JS-C1003 - Importing all patterns
import * as patterns from '../patterns'
import { shapes } from '../symbols'

export const swatch = writable({
	palette,
	patterns,
	keys: {
		gray: ['gray'],
		color: Object.keys(palette).filter((name) => name !== 'gray'),
		symbol: shapes,
		pattern: Object.keys(patterns)
	}
})
