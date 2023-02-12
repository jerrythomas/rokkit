import { scaleBand, scaleLinear } from 'd3-scale'
import { min, max } from 'd3-array'
import { ascending, quantile } from 'd3-array'
import { nest } from 'd3-collection'
import { omit, filter } from 'ramda'

/**
 * Generates a unique id from current timestamp
 *
 * @returns {String} timestamp based unique id
 */
export function uniqueId(prefix = '') {
	return prefix + Date.now().toString(36)
}

/**
 * Capitalizes the first letter of input string
 *
 * @param {String} str
 * @returns {String}
 */
export function initCap(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Removes undefined and null values from the input object.
 *
 * @param {Object} obj
 * @returns {Object}
 */
export function compact(obj) {
	return filter((x) => x !== undefined && x !== null, obj)
}

/**
 * Converts an input number into it's hexadecimal representation, with optional left padded zeroes based on the `size`
 *
 * @param {number} value
 * @param {number} size
 * @returns
 */
export function toHexString(value, size = 2) {
	return value.toString(16).padStart(size, '0')
}

/**
 * Calculates a grid of centres to fit a list of items of `size` within the number of `columns` and `rows`.
 *
 * - Attempts to find a best fit square if both columns and rows are not specified
 * - Value in columns is prioritized over rows for recalculating the grid
 * - Supports padding between the items
 *
 * @param {number} count
 * @param {number} size
 * @param {number} pad
 * @param {number} columns
 * @param {number} rows
 * @returns
 */
export function swatch(count, size, pad = 0, columns, rows) {
	if (columns > 0) {
		rows = Math.ceil(count / columns)
	} else if (rows > 0) {
		columns = Math.ceil(count / rows)
	} else {
		columns = Math.ceil(Math.sqrt(count))
		rows = Math.ceil(count / columns)
	}

	const width = (size + pad) * columns + pad
	const height = (size + pad) * rows + pad
	const data = [...Array(count).keys()].map((index) => ({
		cx: (size + pad) / 2 + (index % columns) * (size + pad),
		cy: (size + pad) / 2 + Math.floor(index / columns) * (size + pad),
		r: size / 2,
	}))

	return { width, height, data }
}
/**
 * Get a scale function mapping the values between a range of lower and upper values
 *
 * @param {array} values
 * @param {array[2]} bounds
 * @param {number} buffer
 * @returns
 */
export function getScale(values, bounds, buffer = 0) {
	if (values.some(isNaN)) {
		return scaleBand().range(bounds).domain(values).padding(0.5)
	} else {
		// ensure that all numeric values are converted to numbers so that d3 min/max provide correct results
		values = values.map((n) => +n)

		let minValue = min(values)
		let maxValue = max(values)

		if (minValue < 0 && maxValue > 0) {
			maxValue = max([-1 * minValue, maxValue])
			minValue = -1 * maxValue
		}
		const margin = (maxValue - minValue) * buffer
		return scaleLinear()
			.domain([minValue - margin, maxValue + margin])
			.range(bounds)
	}
}
/**
 * Obtain the scale function for the `x` and `y` fields in the data set.
 *
 * @param {array<dict>} data
 * @param {string} x
 * @param {string} y
 * @param {number} width
 * @param {number} height
 * @returns
 */
export function getScales(data, x, y, width, height) {
	const xValues = [...new Set(data.map((item) => item[x]))]
	const yValues = [...new Set(data.map((item) => item[y]))]

	return {
		scaleX: getScale(xValues, [0, width]),
		scaleY: getScale(yValues, [height, 0], 0.1),
	}
}

/**
 * Summarize `data` by fields `x` and `y` and return a nested array with
 * key as unique `x` values and value as statistical summaries of `y` values
 *
 * @param {*} data
 * @param {*} x
 * @param {*} y
 * @returns
 */
export function aggregate(data, x, y) {
	const summary = nest()
		.key((d) => d[x])
		.rollup((d) => {
			let values = d.map((g) => g[y]).sort(ascending)
			let q1 = quantile(values, 0.25)
			let q3 = quantile(values, 0.75)
			let median = quantile(values, 0.5)
			let interQuantileRange = q3 - q1
			let min = q1 - 1.5 * interQuantileRange
			let max = q3 + 1.5 * interQuantileRange
			return { q1, q3, median, interQuantileRange, min, max }
		})
		.entries(data)
	return summary
}
export function getPaletteForValues(values, { palette, fallback }) {
	return values.map((value, index) =>
		index < palette.length ? palette[index] : fallback
	)
}

export function toNested(data, key, label) {
	return nest()
		.key((d) => d[key])
		.rollup((values) => values.map((value) => omit([key], value)))
		.entries(data.sort((a, b) => ascending(a[label], b[label])))
}
