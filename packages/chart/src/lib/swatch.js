import { writable } from 'svelte/store'
import palette from './palette.json'
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
