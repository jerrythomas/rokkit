import { ColorBrewer } from './color'
import { scaledPath } from './utils'
import { shapePaths } from './constants'

export class ShapeBrewer {
	constructor() {
		this.shapes = Object.entries(shapePaths).reduce(
			(acc, [name, path]) => ({ ...acc, [name]: (s) => scaledPath(s, path) }),
			{}
		)
		this.repeat = false
		this.keys = Object.keys(this.shapes)
		this.gray = new ColorBrewer().gray()
		this.shades = []
		this.repeat = false
	}

	clear() {
		this.shapes = {}
		return this
	}

	add(shape) {
		const shapes = typeof shape === 'object' ? shape : { shape }
		this.shapes = { ...this.shapes, ...shapes }

		return this
	}

	filter(keys) {
		keys = Array.isArray(keys) ? keys : [keys]
		this.keys = keys.filter((key) => key in this.shapes)

		return this
	}

	colors(shades, repeat = false) {
		this.shades = Array.isArray(shades) ? shades : [shades]
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
