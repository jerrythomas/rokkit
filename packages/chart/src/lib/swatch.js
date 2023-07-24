import { writable } from 'svelte/store'

// import { __patterns__, __colors__, __shapes__ } from './constants'

export const swatchStore = writable({})

// A set of 7 should be sufficient
// array of names and patterns
// array of names and shapes
// array of colors
// array of shades of one color.
