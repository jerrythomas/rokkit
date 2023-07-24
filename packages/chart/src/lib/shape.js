import { ColorBrewer } from './color'

export const namedShapes = {
	square: (s) =>
		`M${0.1 * s} 0` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 0 ${0.1 * s}V${0.9 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.1 * s} ${s}H${0.9 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${s} ${0.9 * s}V${0.1 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.9 * s} 0Z`,
	circle: (s) =>
		`M0 ${0.5 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 ${s} ${0.5 * s}` +
		`A${0.5 * s} ${0.5 * s} 0 0 0 0 ${0.5 * s}`,
	diamond: (s) =>
		`M${0.5 * s} 0` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${s} ${0.5 * s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${0.5 * s} ${s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 0 ${0.5 * s}` +
		`A${0.6 * s} ${0.6 * s} 0 0 0 ${0.5 * s} 0`,
	triangle: (s) =>
		`M${0.5 * s} ${0.0866 * s}L0 ${0.9234 * s}L${s} ${0.9234 * s}Z`,
	rhombus: (s) =>
		`M${0.5 * s} 0` +
		`L${s} ${0.5 * s}` +
		`L${0.5 * s} ${s}` +
		`L0 ${0.5 * s}Z`,
	star: (s) =>
		`M${0.5 * s} ${0.05 * s}` +
		`L${0.606 * s} ${0.36 * s}` +
		`L${s} ${0.36 * s}` +
		`L${0.685 * s} ${0.59 * s}` +
		`L${0.81 * s} ${0.95 * s}` +
		`L${0.5 * s} ${0.725 * s}` +
		`L${0.19 * s} ${0.95 * s}` +
		`L${0.315 * s} ${0.59 * s}` +
		`L0 ${0.36 * s}` +
		`L${0.394 * s} ${0.36 * s}Z`,
	heart: (s) =>
		`M${0.9 * s} ${0.5 * s}` +
		`A${0.08 * s} ${0.08 * s} 0 0 0 ${0.5 * s} ${0.2 * s}` +
		`A${0.08 * s} ${0.08 * s} 0 0 0 ${0.1 * s} ${0.5 * s}` +
		`L${0.5 * s} ${0.9 * s}` +
		`L${0.9 * s} ${0.5 * s}`,
	shurikan: (s) =>
		`M${0.3 * s} ${0.1 * s}L${0.5 * s} 0L${0.7 * s} ${0.1 * s}` +
		`A ${0.05 * s} ${0.05 * s} 0 0 0 ${0.9 * s} ${0.35 * s}` +
		`L${s} ${0.5 * s}L${0.9 * s} ${0.7 * s}` +
		`A ${0.05 * s} ${0.05 * s} 0 0 0 ${0.7 * s} ${0.9 * s}` +
		`L${0.5 * s} ${s}L${0.3 * s} ${0.9 * s}` +
		`A${0.05 * s} ${0.05 * s} 0 0 0 ${0.1 * s} ${0.7 * s}` +
		`L0 ${0.5 * s}L${0.1 * s} ${0.3 * s}` +
		`A${0.05 * s} ${0.05 * s} 0 0 0 ${0.3 * s} ${0.1 * s}` +
		`M${0.4 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.6 * s} ${0.5 * s}` +
		`A${0.1 * s} ${0.1 * s} 0 0 0 ${0.4 * s} ${0.5 * s}`,
	target: (s) =>
		`M${0.2 * s} ${0.5 * s}` +
		`A${0.3 * s} ${0.3 * s} 0 0 0 ${0.8 * s} ${0.5 * s}` +
		`A${0.3 * s} ${0.3 * s} 0 0 0 ${0.2 * s} ${0.5 * s}` +
		`M0 ${0.5 * s}` +
		`L${s} ${0.5 * s}` +
		`M${0.5 * s} 0` +
		`L${0.5 * s} ${s}`
}

export const builtIn = [
	...Object.keys(namedShapes).map((key) => ({ shape: namedShapes[key] })),
	{
		shape: (s) =>
			`M${0.1 * s} ${0.1 * s}` +
			`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.9 * s} ${0.1 * s}` +
			`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.9 * s} ${0.9 * s}` +
			`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.1 * s} ${0.9 * s}` +
			`A${0.5 * s} ${0.5 * s} 0 0 0 ${0.1 * s} ${0.1 * s}`
	},
	{
		shape: (s) =>
			`M${0.5 * s} ${0.3 * s}` +
			`A${0.2 * s} ${0.1 * s} 0 0 0 ${0.5 * s} ${0.1 * s}` +
			`L${0.5 * s} ${0.9 * s}` +
			`M${0.5 * s} ${0.7 * s}` +
			`A${0.2 * s} ${0.1 * s} 0 0 0 ${0.5 * s} ${0.9 * s}` +
			`M${0.3 * s} ${0.5 * s}` +
			`A${0.1 * s} ${0.2 * s} 0 0 0 ${0.1 * s} ${0.5 * s}` +
			`L${0.9 * s} ${0.5 * s}` +
			`M${0.7 * s} ${0.5 * s}` +
			`A${0.1 * s} ${0.2 * s} 0 0 0 ${0.9 * s} ${0.5 * s}`
	},
	{
		shape: (s) =>
			`M${0.1 * s} ${0.3 * s}` +
			`L${0.7 * s} ${0.9 * s}` +
			`L${0.9 * s} ${0.7 * s}` +
			`L${0.3 * s} ${0.1 * s}Z` +
			`M${0.1 * s} ${0.7 * s}` +
			`L${0.7 * s} ${0.1 * s}` +
			`L${0.9 * s} ${0.3 * s}` +
			`L${0.3 * s} ${0.9 * s}Z`
	},
	{
		shape: (s) =>
			`M${0.1 * s} ${0.4 * s}` +
			`L${0.9 * s} ${0.4 * s}` +
			`L${0.9 * s} ${0.6 * s}` +
			`L${0.1 * s} ${0.6 * s}Z` +
			`M${0.4 * s} ${0.1 * s}` +
			`L${0.4 * s} ${0.9 * s}` +
			`L${0.6 * s} ${0.9 * s}` +
			`L${0.6 * s} ${0.1 * s}Z`
	},
	{
		shape: (s) =>
			`M${0.5 * s} ${0.05 * s}` +
			`L${0.19 * s} ${0.95 * s}` +
			`L${s} ${0.36 * s}` +
			`L0 ${0.36 * s}` +
			`L${0.81 * s} ${0.95 * s}Z`
	},
	{
		shape: (s) =>
			`M${0.1 * s} ${0.1 * s}` +
			`L${0.1 * s} ${0.9 * s}` +
			`L${0.9 * s} ${0.9 * s}` +
			`L${0.9 * s} ${0.1 * s}Z` +
			`M${0.1 * s} ${0.1 * s}` +
			`L${0.1 * s} ${0.5 * s}` +
			`L${0.5 * s} ${0.5 * s}` +
			`L${0.5 * s} ${0.1 * s}Z` +
			`M${0.5 * s} ${0.5 * s}` +
			`L${0.5 * s} ${0.9 * s}` +
			`L${0.9 * s} ${0.9 * s}` +
			`L${0.9 * s} ${0.5 * s}Z`
	},
	{
		shape: (s) =>
			`M${0.5 * s} 0` +
			`L${s} ${0.5 * s}` +
			`L${0.5 * s} ${s}` +
			`L0 ${0.5 * s}Z` +
			`M${0.5 * s} 0` +
			`L${s} ${0.5 * s}` +
			`L${0.5 * s} ${s}Z`
	},
	{
		shape: (s) =>
			`M0 ${0.5 * s}` +
			`A${0.6 * s} ${0.4 * s} 0 0 0 ${s} ${0.5 * s}` +
			`A${0.6 * s} ${0.4 * s} 0 0 0 0 ${0.5 * s}` +
			`M${0.5 * s} 0` +
			`A${0.4 * s} ${0.6 * s} 0 0 0 ${0.5 * s} ${s}` +
			`A${0.4 * s} ${0.6 * s} 0 0 0 ${0.5 * s} 0`
	}
]

export class ShapeBrewer {
	constructor() {
		this.shapes = builtIn
		this.repeat = false
		this.indices = [...this.shapes.keys()]
		this.gray = new ColorBrewer().gray()
		this.shades = []
		this.repeat = false
	}

	clear() {
		this.shapes = []
		return this
	}

	add(shape) {
		const shapes = Array.isArray(shape) ? shape : [shape]
		this.shapes = [...shapes]

		return this
	}

	filter(indices) {
		indices = Array.isArray(indices) ? indices : [indices]
		this.indices = indices.filter((i) => i > 0 && i < this.shapes.length)

		return this
	}

	colors(shades, repeat = false) {
		this.shades = Array.isArray(shades) ? shades : [shades]
		this.repeat = repeat
		return this
	}

	brew() {
		return this.indices
			.map((i) => this.shapes[i])
			.map((shape, i) => {
				return i < this.shades.length || this.repeat
					? { ...shape, ...this.shades[i % this.shades.length] }
					: { ...shape, ...this.gray }
			})
	}
}
