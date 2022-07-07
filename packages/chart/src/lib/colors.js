// import { writable } from 'svelte/store'
import { repeatAcross } from '../lib/utils'

const palette = [
	'#FFDE6B',
	'#EF89EE',
	'#F79F1E',
	'#02B8FF',
	'#9F84EC',
	'#15CBC4',
	'#0092FD',
	'#F63A57',
	'#A2CB39',
	'#FF6E2F',
	'#FEB8B9',
	'#af7aa1',
	'#7EFFF5'
]

export class Palette {
	constructor(colors = palette) {
		this.colors = colors
	}

	set colors(value) {
		if (value && Array.isArray(value)) this.colors = value
	}
}

export function colorBrewer(values) {
	return repeatAcross(palette, [...new Set(values)])
}
