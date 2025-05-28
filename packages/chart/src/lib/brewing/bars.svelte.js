import {} from './types.js'

/**
 * @typedef {import('./types').BarData} BarData
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * Creates bar data for rendering
 *
 * @param {Array} data - Chart data
 * @param {Object} fields - Field mappings
 * @param {string} fields.x - X-axis field
 * @param {string} fields.y - Y-axis field
 * @param {string} fields.color - Color field (optional)
 * @param {Object} scales - Chart scales
 * @param {Function} scales.x - X-axis scale
 * @param {Function} scales.y - Y-axis scale
 * @param {Function} scales.color - Color scale
 * @param {Object} dimensions - Chart dimensions
 * @param {string} defaultColor - Default color if no color scale is provided
 * @returns {BarData[]} Bar data for rendering
 */
export function createBars(data, fields, scales, dimensions, defaultColor = '#4682b4') {
	if (!data || data.length === 0 || !scales.x || !scales.y) return []

	const { x: xField, y: yField, color: colorField } = fields

	return data.map((d) => {
		const barWidth = scales.x.bandwidth ? scales.x.bandwidth() : 10
		const barX = scales.x.bandwidth ? scales.x(d[xField]) : scales.x(d[xField]) - barWidth / 2

		return {
			data: d,
			x: barX,
			y: scales.y(d[yField]),
			width: barWidth,
			height: dimensions.innerHeight - scales.y(d[yField]),
			color: colorField && scales.color ? scales.color(d[colorField]) : defaultColor
		}
	})
}

/**
 * Filter bars based on a selection criteria
 *
 * @param {BarData[]} bars - Bar data array
 * @param {Object} selection - Selection criteria
 * @returns {BarData[]} Filtered bars
 */
export function filterBars(bars, selection) {
	if (!selection) return bars

	return bars.filter((bar) => {
		for (const [key, value] of Object.entries(selection)) {
			if (bar.data[key] !== value) return false
		}
		return true
	})
}

/**
 * Creates a grouped bars layout
 *
 * @param {Array} data - Chart data
 * @param {Object} fields - Field mappings
 * @param {Object} scales - Chart scales
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Options
 * @returns {Object} Grouped bar data
 */
export function createGroupedBars(data, fields, scales, dimensions, options = {}) {
	if (!data || data.length === 0 || !fields.group) return { groups: [], bars: [] }

	const { x: xField, y: yField, group: groupField, color: colorField = groupField } = fields
	const { padding = 0.1 } = options

	// Get unique groups and x values
	const groups = [...new Set(data.map((d) => d[groupField]))]
	const xValues = [...new Set(data.map((d) => d[xField]))]

	// Calculate group width and individual bar width
	const xScale = scales.x
	const groupWidth = xScale.bandwidth ? xScale.bandwidth() : 20
	const barWidth = (groupWidth - padding * (groups.length - 1)) / groups.length

	// Create bars for each group
	const bars = []

	xValues.forEach((xValue) => {
		const groupItems = data.filter((d) => d[xField] === xValue)
		const xPos = xScale(xValue)

		groups.forEach((group, i) => {
			const item = groupItems.find((d) => d[groupField] === group)
			if (!item) return

			const barX = xPos + i * (barWidth + padding)
			bars.push({
				data: item,
				group,
				x: barX,
				y: scales.y(item[yField]),
				width: barWidth,
				height: dimensions.innerHeight - scales.y(item[yField]),
				color: scales.color ? scales.color(item[colorField]) : '#4682b4'
			})
		})
	})

	return { groups, bars }
}
