import { scaleBand, scaleLinear, scaleSqrt } from 'd3-scale'
import { max, extent } from 'd3-array'

/**
 * Builds an x scale (band for categorical, linear for numeric).
 * @param {Object[]} data
 * @param {string} field
 * @param {number} width - inner width (pixels)
 * @param {{ padding?: number }} opts
 */
export function buildXScale(data, field, width, opts = {}) {
	const values = [...new Set(data.map((d) => d[field]))]
	const isNumeric = values.every((v) => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''))
	if (isNumeric) {
		const [minVal, maxVal] = extent(data, (d) => Number(d[field]))
		return scaleLinear().domain([minVal, maxVal]).range([0, width]).nice()
	}
	return scaleBand()
		.domain(values)
		.range([0, width])
		.padding(opts.padding ?? 0.2)
}

function maxFromLayer(layer) {
	if (layer.data && layer.y) return max(layer.data, (d) => Number(d[layer.y])) ?? 0
	return 0
}

/**
 * Builds a y linear scale from 0 to max, extended by any layer overrides.
 * @param {Object[]} data
 * @param {string} field
 * @param {number} height - inner height (pixels)
 * @param {Array<{data?: Object[], y?: string}>} layers
 */
export function buildYScale(data, field, height, layers = []) {
	const dataMax = max(data, (d) => Number(d[field])) ?? 0
	const maxVal = layers.reduce((m, layer) => Math.max(m, maxFromLayer(layer)), dataMax)
	return scaleLinear().domain([0, maxVal]).range([height, 0]).nice()
}

/**
 * Builds a sqrt scale for bubble/point size.
 * @param {Object[]} data
 * @param {string} field
 * @param {number} maxRadius
 */
export function buildSizeScale(data, field, maxRadius = 20) {
	const maxVal = max(data, (d) => Number(d[field])) ?? 1
	return scaleSqrt().domain([0, maxVal]).range([0, maxRadius])
}
