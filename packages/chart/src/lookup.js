import { writable } from 'svelte/store'

// import { __patterns__, __colors__, __shapes__ } from './constants'

export const swatchStore = writable({})

// export function swatch(colors, patterns, shapes, defaults) {
// 	const limit = min([colors.length, patterns.length, shapes.length])

// 	swatchStore.set({
// 		colors: colors.slice(0, limit),
// 		patterns: patterns.slice(0, limit),
// 		shapes: shapes.slice(0, limit),
// 		defaults: {
// 			color: '#eeeeee',
// 			shape: __shapes__.circle,
// 			pattern: __patterns__.empty,
// 			...defaults
// 		}
// 	})
// }

export function spread(values, across, filler) {
	const unique = [...new Set(values)]
	const lookup = unique.map((k, i) => ({
		[k]: i < across.length ? across[i] : filler
	}))
	return (k) => lookup[k]
}
