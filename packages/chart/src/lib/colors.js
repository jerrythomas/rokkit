import { writable } from 'svelte/store'
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

class Palette {
	#colors = palette

	constructor(colors) {
		this.colors = colors
	}

	get colors() {
		return this.#colors
	}
	set colors(colors) {
		if (colors && Array.isArray(colors)) this.#colors = colors
	}
}

export function colorBrewer(values) {
	return repeatAcross(palette, [...new Set(values)])
}
