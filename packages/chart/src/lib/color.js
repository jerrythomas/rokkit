import { palette } from './constants'

export class ColorBrewer {
	constructor() {
		this.colors = ['blue', 'pink', 'teal', 'indigo', 'purple', 'amber', 'rose']
		this.palette = palette
		this.grayscale = this.palette['trueGray']
		this.fill = 100
		this.stroke = 600
		this.contrast = 600
	}

	dark() {
		this.fill = 500
		this.stroke = 700
		this.contrast = 100
		return this
	}

	mix(fill, stroke, contrast) {
		this.fill = Object.keys(this.grayscale).includes(fill) ? fill : this.fill
		this.stroke = Object.keys(this.grayscale).includes(stroke)
			? stroke
			: this.stroke
		this.contrast = Object.keys(this.grayscale).includes(contrast)
			? contrast
			: this.contrast

		return this
	}

	swatch(colors) {
		this.palette = colors
		return this
	}

	filter(colors) {
		this.colors = colors
		return this
	}

	gray() {
		return {
			fill: this.grayscale[this.fill],
			stroke: this.grayscale[this.stroke],
			contrast: this.grayscale[this.contrast]
		}
	}

	brew() {
		const palette = this.colors.map((color) => ({
			fill: this.palette[color][this.fill],
			stroke: this.palette[color][this.stroke],
			contrast: this.palette[color][this.contrast]
		}))

		return palette
	}
}
