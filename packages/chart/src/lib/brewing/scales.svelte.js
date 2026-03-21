import { SvelteSet } from 'svelte/reactivity'
import { min, max } from 'd3-array'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import {} from './types.js'
import { buildXScale } from '../xscale.js'

/**
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * @param {Array} data
 * @param {string} colorField
 * @returns {import('d3-scale').ScaleOrdinal}
 */
function buildColorScale(data, colorField) {
	const colorValues = [...new SvelteSet(data.map((d) => d[colorField]))]
	return scaleOrdinal().domain(colorValues).range(schemeCategory10)
}

/**
 * @param {Array} data
 * @param {string} yField
 * @param {Object} dimensions
 * @returns {import('d3-scale').ScaleContinuousNumeric}
 */
function buildYScale(data, yField, dimensions) {
	const yValues = data.map((d) => d[yField])
	return scaleLinear()
		.domain([0, max(yValues) * 1.1])
		.nice()
		.range([dimensions.innerHeight, 0])
}

/**
 * @param {Array} data
 * @param {ScaleFields} fields
 * @returns {boolean}
 */
function hasRequiredFields(data, fields) {
	return Boolean(data && data.length && fields.x && fields.y)
}

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
	if (!hasRequiredFields(data, fields)) return { x: null, y: null, color: null }

	const padding = options.padding ?? 0.2
	const xValues = data.map((d) => d[fields.x])

	return {
		x: buildXScale(xValues, dimensions, padding),
		y: buildYScale(data, fields.y, dimensions),
		color: fields.color ? buildColorScale(data, fields.color) : null
	}
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
