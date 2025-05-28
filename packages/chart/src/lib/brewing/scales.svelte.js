import { min, max } from 'd3-array'
import { scaleBand, scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import {} from './types.js'

/**
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * Creates scales based on data, fields, and dimensions
 *
 * @param {Array} data - Chart data
 * @param {ScaleFields} fields - Field mappings
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Scale options
 * @param {number} [options.padding=0.2] - Padding for band scales
 * @returns {ChartScales} Chart scales
 */
export function createScales(data, fields, dimensions, options = {}) {
	const scales = {
		x: null,
		y: null,
		color: null
	}

	if (!data || data.length === 0 || !fields.x || !fields.y) {
		return scales
	}

	const padding = options.padding !== undefined ? options.padding : 0.2

	// Extract values
	const xValues = data.map((d) => d[fields.x])
	const yValues = data.map((d) => d[fields.y])

	// Determine x scale type
	const xIsDate = xValues.some((v) => v instanceof Date)
	const xIsNumeric = !xIsDate && xValues.every((v) => !isNaN(parseFloat(v)))

	// Create x scale based on data type
	if (xIsDate) {
		scales.x = scaleTime()
			.domain([min(xValues), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	} else if (xIsNumeric) {
		scales.x = scaleLinear()
			.domain([min([0, ...xValues]), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	} else {
		scales.x = scaleBand().domain(xValues).range([0, dimensions.innerWidth]).padding(padding)
	}

	// Create y scale
	scales.y = scaleLinear()
		.domain([0, max(yValues) * 1.1]) // Add 10% padding on top
		.nice()
		.range([dimensions.innerHeight, 0])

	// Create color scale if color field is set
	if (fields.color) {
		const colorValues = [...new Set(data.map((d) => d[fields.color]))]
		scales.color = scaleOrdinal().domain(colorValues).range(schemeCategory10)
	}

	return scales
}

/**
 * Gets the origin coordinates for the axes
 *
 * @param {ChartScales} scales - Chart scales
 * @param {Object} dimensions - Chart dimensions
 * @returns {Object} Origin coordinates
 */
export function getOrigin(scales, dimensions) {
	return {
		x: scales.y ? scales.y(0) : dimensions.innerHeight,
		y: scales.x ? (scales.x.ticks ? scales.x(Math.max(0, min(scales.x.domain()))) : 0) : 0
	}
}
