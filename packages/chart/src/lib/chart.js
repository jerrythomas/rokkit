// export function scales(data, aes, opts) {
// 	const { x, y } = aes
// 	const { width, height, flipCoords } = {
// 		width: 800,
// 		height: 600,
// 		flipCoords: false,
// 		...opts
// 	}

// 	return { x, y, width, height, flipCoords }
// }

import { nest } from 'd3-collection'
import { max, quantile, ascending, bin } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import { area, curveCatmullRom } from 'd3-shape'
import { getScale } from './utils'

/**
 * axis, theme, params, fields
 */
export class ChartBrewer {
	constructor(data, x, y) {
		this.data = data
		this.x = x
		this.y = y
		this.fill = x
		this.axis = null
		this.stats = {}
		// this.yOffset = 20
		this.padding = 10
		this.margin = {
			left: 10,
			top: 10,
			right: 10,
			bottom: 10
		}
		this.params = {
			ticks: {}
		}
		this.labels = []
		this.width = 800
		this.height = (this.width * 7) / 16
		this.scaleValues = null
		this.theme = {}
	}

	computeMargin(xAxisOrientation, yAxisOrientation) {
		this.scaleValues = {
			x: [...new Set(this.data.map((item) => item[this.x]))],
			y: [...new Set(this.data.map((item) => item[this.y]))],
			fill: [...new Set(this.data.map((item) => item[this.fill]))]
		}

		let xOffset = max(this.scaleValues.y.map((value) => value.toString().length)) * 10
		let yOffset = 20

		this.margin = {
			left: this.padding + (yAxisOrientation === 'left' ? xOffset : 0),
			right: this.padding + (yAxisOrientation === 'left' ? 0 : xOffset),
			top: this.padding + (xAxisOrientation === 'bottom' ? 0 : yOffset),
			bottom: this.padding + (xAxisOrientation === 'bottom' ? yOffset : 0)
		}
	}

	computeAxis(buffer = 0, inverse = false) {
		let x = {}
		let y = {}
		let fill = {}

		if (!this.scaleValues) {
			this.computeMargin('bottom', 'left')
		}

		x.scale = getScale(
			this.scaleValues.x,
			[this.margin.left, this.width - this.margin.right],
			buffer
		)
		const domainY = inverse
			? [this.margin.top, this.height - this.margin.bottom]
			: [this.height - this.margin.bottom, this.margin.top]
		y.scale = getScale(this.scaleValues.y, domainY, buffer)

		x.ticks = tickValues(x.scale, 'x', this.params)
		y.ticks = tickValues(y.scale, 'y', this.params)

		this.axis = { x, y, fill }
		return this
	}
	use(theme) {
		this.theme = theme
		return this
	}

	params(margin, ticks) {
		this.margin = margin
		this.ticks = ticks
		return this
	}

	fillWith(fill) {
		this.fill = fill
		return this
	}

	highlight(values) {
		this.highlight = values
		return this
	}

	animate() {
		return this
	}

	summary() {
		const result = nest()
			.key((d) => d[this.x])
			.rollup((d) => {
				let values = d.map((g) => g[this.y]).sort(ascending)
				let q1 = quantile(values, 0.25)
				let q3 = quantile(values, 0.75)
				let median = quantile(values, 0.5)
				let interQuantileRange = q3 - q1
				let min = q1 - 1.5 * interQuantileRange
				let max = q3 + 1.5 * interQuantileRange
				return { q1, q3, median, interQuantileRange, min, max }
			})
			.entries(this.data)
		return result
	}

	// assumes axis has been computes
	violin() {
		if (!this.axis) this.computeAxis()
		// Features of the histogram
		var histogramBins = bin()
			.domain(this.axis.y.scale.domain())
			.thresholds(this.axis.y.scale.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
			.value((d) => d)

		// Compute the binning for each group of the dataset
		var sumstat = nest()
			.key((d) => d[this.x])
			.rollup((d) => histogramBins(d.map((g) => +g[this.y])))
			.entries(this.data)

		// What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
		var maxNum = 0
		for (let i in sumstat) {
			let allBins = sumstat[i].value
			let lengths = allBins.map((a) => a.length)
			let longest = max(lengths)
			if (longest > maxNum) {
				maxNum = longest
			}
		}

		// The maximum width of a violin must be x.bandwidth = the width dedicated to a group
		var xNum = scaleLinear().range([0, this.axis.x.scale.bandwidth()]).domain([0, maxNum])

		let result = area()
			.x0(xNum(0))
			.x1(function (d) {
				return xNum(d.length)
			})
			.y((d) => this.axis.y.scale(d.x0))
			.curve(curveCatmullRom)

		let areas = sumstat.map((d) => ({
			curve: result(d.value),
			x: this.axis.x.scale(d.key)
		}))
		return areas
	}
}

function tickValues(scale, whichAxis, params) {
	let { values, count } = whichAxis in params.ticks ? params.ticks[whichAxis] : {}
	values =
		Array.isArray(values) && values.length > 2
			? values
			: scale.ticks
			? scale.ticks.apply(scale, [count])
			: scale.domain()
	const ticks = values.map((label) => ({ label, position: scale(label) }))

	return ticks
}
