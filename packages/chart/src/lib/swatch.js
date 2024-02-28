// import { omit } from 'ramda'
import { writable } from 'svelte/store'
import { palette } from './palette'
// import { patterns } from '../patterns/constants'
import * as patterns from '../patterns'
import { shapes } from '../symbols'

// const combinedPatterns = {
// 	...patterns,
// 	...omit(['NamedPattern'], components)
// }

// const combinedShapes = {
// 	...namedShapes,
// 	...shapes
// }
export const swatch = writable({
	palette,
	patterns,
	// symbols: combinedShapes,
	keys: {
		gray: ['gray'],
		color: Object.keys(palette).filter((name) => name !== 'gray'),
		symbol: shapes,
		pattern: Object.keys(patterns)
	}
})
