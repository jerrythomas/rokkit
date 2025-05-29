import {} from './types.js'

/**
 * @typedef {import('./types').LegendItem} LegendItem
 * @typedef {import('./types').LegendData} LegendData
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * Creates legend data for rendering
 *
 * @param {Array} data - Chart data
 * @param {Object} fields - Field mappings
 * @param {string} fields.color - Color field
 * @param {Object} scales - Chart scales
 * @param {Function} scales.color - Color scale
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Legend options
 * @param {string} [options.title=''] - Legend title
 * @param {string} [options.align='right'] - Legend alignment ('left', 'center', or 'right')
 * @param {string} [options.shape='rect'] - Legend marker shape ('rect' or 'circle')
 * @param {number} [options.markerSize=10] - Size of legend markers
 * @returns {LegendData} Legend rendering data
 */
export function createLegend(data, fields, scales, dimensions, options = {}) {
	if (!data || !fields.color || !scales.color) {
		return { items: [], title: '', transform: 'translate(0, 0)' }
	}

	const { title = '', align = 'right', shape = 'rect', markerSize = 10 } = options

	// Get unique color values
	const colorValues = [...new Set(data.map((d) => d[fields.color]))]

	// Create legend items
	const items = colorValues.map((value, index) => ({
		value,
		color: scales.color(value),
		y: index * (markerSize + 5) + (title ? 15 : 0),
		shape,
		markerSize
	}))

	// Calculate approximate width for alignment
	const approximateWidth =
		Math.max(...colorValues.map((v) => v.toString().length)) * 8 + markerSize + 10

	// Calculate position based on alignment
	let x = 0
	if (align === 'right') {
		x = dimensions.innerWidth - approximateWidth
	} else if (align === 'center') {
		x = (dimensions.innerWidth - approximateWidth) / 2
	}

	return {
		items,
		title,
		transform: `translate(${x}, 0)`
	}
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
