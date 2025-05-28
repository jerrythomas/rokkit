import { min, max } from 'd3-array'
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale'

function getScale(domain, range, padding = 0) {
	if (domain.some(isNaN)) {
		return scaleBand().domain(domain).range(range).padding(padding)
	} else if (domain[0] instanceof Date) {
		return scaleTime()
			.domain([min(domain), max(domain)])
			.range(range)
			.nice()
	}

	return scaleLinear()
		.domain([min([0, ...domain]), max([0, ...domain])])
		.range(range)
		.nice()
}

class Chart {
	// data = []
	// width = 512
	// height = 512
	// origin = { x: 0, y: 0 }
	// range = {
	// 	x: [0, this.width],
	// 	y: [this.height, 0]
	// }
	// x
	// y
	// stat = 'identity'
	// scale
	// fill
	// color
	// value
	// shape
	// valueFormat
	// valueLabel
	// domain
	// margin
	// spacing
	// padding
	// flipCoords = false

	constructor(data, opts) {
		this.width = Number(opts.width) || 2048
		this.height = Number(opts.height) || 2048
		this.flipCoords = opts.flipCoords || false
		this.x = opts.x
		this.y = opts.y
		this.value = opts.value || opts.y
		this.valueLabel = opts.valueLabel || this.value
		this.valueFormat = opts.valueFormat || ((d) => d)
		this.fill = opts.fill || opts.x
		this.color = opts.color || opts.fill
		this.shape = opts.shape || opts.fill

		this.padding = opts.padding !== undefined ? Number(opts.padding) : 32

		this.spacing =
			Number(opts.spacing) >= 0 && Number(opts.spacing) <= 0.5 ? Number(opts.spacing) : 0
		this.margin = {
			top: Number(opts.margin?.top) || 0,
			left: Number(opts.margin?.left) || 0,
			right: Number(opts.margin?.right) || 0,
			bottom: Number(opts.margin?.bottom) || 0
		}
		this.domain = {
			x: [...new Set(data.map((d) => d[this.x]))],
			y: [...new Set(data.map((d) => d[this.y]))]
		}
		if (this.flipCoords) {
			this.domain = { y: this.domain.x, x: this.domain.y }
		}
		this.stat = opts.stat || 'identity'

		this.data = data.map((d) => ({
			x: this.flipCoords ? d[this.y] : d[this.x],
			y: this.flipCoords ? d[this.x] : d[this.y],
			// fill: d[this.fill],
			color: d[this.color]
			// shape: d[this.shape]
		}))

		this.refresh()
	}

	padding(value) {
		this.padding = value
		return this.refresh()
	}

	margin(value) {
		this.margin = value
		return this.refresh()
	}

	refresh() {
		this.range = {
			x: [this.margin.left + this.padding, this.width - this.margin.right - this.padding],
			y: [this.height - this.padding - this.margin.bottom, this.margin.top + this.padding]
		}

		const scale = {
			x: getScale(this.domain.x, this.range.x, this.spacing),
			y: getScale(this.domain.y, this.range.y, this.spacing)
		}

		// scale['value'] = this.value === this.x ? scale.x : scale.y

		this.origin = {
			x: getOriginValue(scale.x),
			y: getOriginValue(scale.y)
		}

		this.scale = scale

		return this
	}

	// get scale() {
	// 	return this.scale
	// }
	// get origin() {
	// 	return this.origin
	// }
	// get margin() {
	// 	return this.margin
	// }
	// get range() {
	// 	const [x1, x2] = this.scale.x.range()
	// 	const [y1, y2] = this.scale.y.range()

	// 	return { x1, y1, x2, y2 }
	// }
	// get data() {
	// 	// aggregate data group by x,y,fill,shape, color
	// 	// stat = [min, max, avg, std, q1, q3, median, sum, count, box, all]

	// 	return this.data
	// }
	// get width() {
	// 	return this.width
	// }
	// get height() {
	// 	return this.height
	// }
	// set width(value) {
	// 	this.width = value
	// }
	// set height(value) {
	// 	this.height = value
	// }
	// get domain() {
	// 	return this.domain
	// }
	// get flipCoords() {
	// 	return this.flipCoords
	// }
	aggregate(value, stat) {
		this.value = value
		this.stat = stat

		// this.data = nest(this.data)
	}

	ticks(axis, count, fontSize = 8) {
		const scale = this.scale[axis]
		const [minRange, maxRange] = scale.range()
		let ticks = []
		let offset = 0

		count = count || Math.abs((maxRange - minRange) / (fontSize * (axis === 'y' ? 8 : 8)))

		if (scale.ticks) {
			ticks = scale.ticks(Math.round(count))
		} else {
			offset = scale.bandwidth() / 2
			count = Math.min(Math.round(count), scale.domain().length)

			ticks = scale.domain()
			if (count < scale.domain().length) {
				const diff = scale.domain().length - count
				ticks = ticks.filter((d, i) => i % diff === 0)
			}
		}

		ticks = ticks
			.map((t) => ({
				label: t,
				pos: scale(t)
			}))
			.map(({ label, pos }) => ({
				label,
				offset: {
					x: axis === 'x' ? offset : 0,
					y: axis === 'y' ? offset : 0
				},
				x: axis === 'x' ? pos : this.origin.x,
				y: axis === 'y' ? pos : this.origin.y
			}))

		return ticks
	}
}

function getOriginValue(scale) {
	return scale.ticks ? scale(Math.max(0, Math.min(...scale.domain()))) : scale.range()[0]
}

export function chart(data, aes) {
	return new Chart(data, aes)
}
