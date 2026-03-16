import { SvelteSet } from 'svelte/reactivity'
import {} from './types.js'

/**
 * @typedef {import('./types').LegendItem} LegendItem
 * @typedef {import('./types').LegendData} LegendData
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

const LEGEND_DEFAULTS = { title: '', align: 'right', shape: 'rect', markerSize: 10 }

/**
 * Compute the x-position for legend alignment
 * @param {string} align
 * @param {number} innerWidth
 * @param {number} approximateWidth
 * @returns {number}
 */
function legendX(align, innerWidth, approximateWidth) {
	if (align === 'right') return innerWidth - approximateWidth
	if (align === 'center') return (innerWidth - approximateWidth) / 2
	return 0
}

/**
 * @param {Array} colorValues
 * @param {Function} colorScale
 * @param {{ shape: string, markerSize: number, titleOffset: number }} style
 * @returns {LegendItem[]}
 */
function buildLegendItems(colorValues, colorScale, style) {
	const { shape, markerSize, titleOffset } = style
	return colorValues.map((value, index) => ({
		value,
		color: colorScale(value),
		y: index * (markerSize + 5) + titleOffset,
		shape,
		markerSize
	}))
}

/**
 * @param {Array} colorValues
 * @param {number} markerSize
 * @returns {number}
 */
function approximateLegendWidth(colorValues, markerSize) {
	return Math.max(...colorValues.map((v) => v.toString().length)) * 8 + markerSize + 10
}

/**
 * @param {Object} options
 * @returns {{ dimensions: Object, title: string, align: string, shape: string, markerSize: number }}
 */
function parseLegendOptions(options) {
	const merged = Object.assign({}, LEGEND_DEFAULTS, options || {})
	return {
		dimensions: merged.dimensions,
		title: merged.title,
		align: merged.align,
		shape: merged.shape,
		markerSize: merged.markerSize
	}
}

/**
 * @param {Object|undefined} dimensions
 * @returns {number}
 */
function innerWidth(dimensions) {
	return dimensions ? dimensions.innerWidth : 0
}

/**
 * Creates legend data for rendering
 *
 * @param {Array} data - Chart data
 * @param {Object} fields - Field mappings
 * @param {string} fields.color - Color field
 * @param {Object} scales - Chart scales
 * @param {Function} scales.color - Color scale
 * @param {Object} options - Legend options including dimensions
 * @param {Object} options.dimensions - Chart dimensions
 * @param {string} [options.title=''] - Legend title
 * @param {string} [options.align='right'] - Legend alignment ('left', 'center', or 'right')
 * @param {string} [options.shape='rect'] - Legend marker shape ('rect' or 'circle')
 * @param {number} [options.markerSize=10] - Size of legend markers
 * @returns {LegendData} Legend rendering data
 */
export function createLegend(data, fields, scales, options) {
	if (!data || !fields.color || !scales.color) {
		return { items: [], title: '', transform: 'translate(0, 0)' }
	}

	const { dimensions, title, align, shape, markerSize } = parseLegendOptions(options)
	const colorValues = [...new SvelteSet(data.map((d) => d[fields.color]))]
	const titleOffset = title ? 15 : 0
	const style = { shape, markerSize, titleOffset }
	const items = buildLegendItems(colorValues, scales.color, style)
	const approxWidth = approximateLegendWidth(colorValues, markerSize)
	const x = legendX(align, innerWidth(dimensions), approxWidth)

	return { items, title, transform: `translate(${x}, 0)` }
}

/**
 * Filter data based on legend selection
 *
 * @param {Array} data - Chart data
 * @param {string} colorField - Field used for color mapping
 * @param {Array} selectedValues - Selected legend values
 * @returns {Array} Filtered data
 */
export function filterByLegend(data, colorField, selectedValues) {
	if (!selectedValues || selectedValues.length === 0) {
		return data
	}

	return data.filter((d) => selectedValues.includes(d[colorField]))
}

/**
 * Create attributes for legend items
 *
 * @param {LegendItem} item - Legend item
 * @returns {Object} Attributes for the legend item
 */
export function createLegendItemAttributes(item) {
	return {
		'data-plot-legend-item': '',
		transform: `translate(0, ${item.y})`,
		role: 'img',
		'aria-label': `Legend item for ${item.value}`
	}
}
