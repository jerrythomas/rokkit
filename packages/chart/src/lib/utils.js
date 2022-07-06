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
	let pair = prefix && prefix.length > 0 ? [prefix] : []
	pair.push(Date.now().toString(36))
	return pair.join('-')
}

/**
 * Capitalizes the first letter of input string
 *
 * @param {String} str
 * @returns {String}
 */
export function initCap(str) {
	return str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase()
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
		r: size / 2
	}))

	return { width, height, data }
}
/**
 * Get a scale function mapping the values between a range of lower and upper values
 *
 * @param {Array} values
 * @param {Array[2]} bounds
 * @param {number} buffer
 * @returns
 */
export function getScale(values, bounds, buffer = 0, ordinal = false) {
	if (ordinal || values.some(isNaN)) {
		return scaleBand().range(bounds).domain(values).padding(0.5)
	} else {
		values = values.map((x) => +x)

		let minValue = min([...values, 0])
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
export function getScales(data, x, y, width, height, margin, ordinal) {
	const xValues = [...new Set(data.map((item) => item[x]))]
	const yValues = [...new Set(data.map((item) => item[y]))]

	return {
		x: getScale(xValues, [0 + margin.left, width - margin.right], 0, ordinal.x),
		y: getScale(yValues, [height - margin.top, margin.bottom], 0.1, ordinal.y)
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

/**
 * Generate a palette with same size as input data containing values from palette array.
 * After the palette array is exhausted the fallback value is used
 *
 * @param {Array} values
 * @param {Array} palette
 * @param {*}     fallback
 * @returns
 */
export function getPaletteForValues(values, palette, fallback) {
	return values.map(({}, index) =>
		index < palette.length ? palette[index] : fallback
	)
}

/**
 * Converts input object array into a nested key,value array.
 * 'key' contains unique values for the attribute specified by the key parameter
 * and value contains array of all remaining attributes in an array.
 *
 * @param {Array<Object>} data
 * @param {string} key
 * @param {string} label
 * @returns
 */
export function toNested(data, key, label) {
	return nest()
		.key((d) => d[key])
		.rollup((values) => values.map((value) => omit([key], value)))
		.entries(data.sort((a, b) => ascending(a[label], b[label])))
}
/**
 * Repeats array items of b using array items of a ask keys
 *
 * @param {Array} b
 * @param {Array} a
 * @returns {Object} with keys as items in a and values as items in b
 */
export function repeatAcross(b, a) {
	return a.reduce(
		(acc, item, index) => ({ ...acc, [item]: b[index % b.length] }),
		{}
	)
}
