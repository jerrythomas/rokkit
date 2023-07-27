import { ColorBrewer } from './color'
import { symbols } from '@rokkit/atoms/symbols'
import { addToArray, toArray } from './utils'
export class ShapeBrewer {
	constructor() {
		this.shapes = Object.keys(symbols)
		this.repeat = false
		this.keys = Object.keys(this.shapes)
		this.gray = new ColorBrewer().gray()
		this.shades = []
		this.repeat = false
	}

	clear() {
		this.shapes = []
		return this
	}

	add(shape) {
		this.shapes = addToArray(this.shapes, shape)

		return this
	}

	filter(keys) {
		this.keys = toArray(keys).filter((key) => key in this.shapes)

		return this
	}

	colors(shades, repeat = false) {
		this.shades = toArray(shades)
		this.repeat = repeat
		return this
	}

	brew() {
		return this.keys
			.map((i) => this.shapes[i])
			.map((shape, i) => {
				return i < this.shades.length || this.repeat
					? { shape, ...this.shades[i % this.shades.length] }
					: { shape, ...this.gray }
			})
	}
}
