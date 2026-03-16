import { SvelteSet } from 'svelte/reactivity'
import {} from './types.js'

/**
 * @typedef {import('./types').BarData} BarData
 * @typedef {import('./types').ScaleFields} ScaleFields
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

const DEFAULT_COLOR = '#4682b4'

/**
 * @param {Object} d - data item
 * @param {{ fields: Object, scales: Object, dimensions: Object, defaultColor: string }} ctx
 * @returns {BarData}
 */
function buildBar(d, ctx) {
	const { fields, scales, dimensions, defaultColor } = ctx
	const { x: xField, y: yField, color: colorField } = fields
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
}

/**
 * @param {Object} options
 * @param {Object} fields
 * @param {Object} scales
 * @returns {{ ctx: Object }|null} null if input is invalid
 */
function parseBarsInput(options, fields, scales) {
	if (!scales.x || !scales.y) return null
	const opts = options || {}
	return {
		fields,
		scales,
		dimensions: opts.dimensions,
		defaultColor: opts.defaultColor !== undefined ? opts.defaultColor : DEFAULT_COLOR
	}
}

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
 * @param {Object} options - Options including dimensions and defaultColor
 * @param {Object} options.dimensions - Chart dimensions
 * @param {string} [options.defaultColor='#4682b4'] - Default color if no color scale
 * @returns {BarData[]} Bar data for rendering
 */
export function createBars(data, fields, scales, options) {
	if (!data || !data.length) return []
	const ctx = parseBarsInput(options, fields, scales)
	if (!ctx) return []
	return data.map((d) => buildBar(d, ctx))
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
 * @param {Object} item - data item
 * @param {Object} scales - chart scales
 * @param {{ yField: string, colorField: string, group: unknown, barX: number, barWidth: number, dimensions: Object }} ctx
 * @returns {BarData}
 */
function buildGroupBar(item, scales, ctx) {
	const { yField, colorField, group, barX, barWidth, dimensions } = ctx
	return {
		data: item,
		group,
		x: barX,
		y: scales.y(item[yField]),
		width: barWidth,
		height: dimensions.innerHeight - scales.y(item[yField]),
		color: scales.color ? scales.color(item[colorField]) : DEFAULT_COLOR
	}
}

/**
 * @param {Object} scales
 * @param {{ groupItems: Array, groupField: string, group: unknown, i: number, yField: string, colorField: string, barWidth: number, padding: number, dimensions: Object, xPos: number }} ctx
 * @returns {BarData|null}
 */
function buildOneGroupBar(scales, ctx) {
	const { groupItems, groupField, group, i, yField, colorField, barWidth, padding, dimensions, xPos } = ctx
	const item = groupItems.find((d) => d[groupField] === group)
	if (!item) return null
	const barX = xPos + i * (barWidth + padding)
	return buildGroupBar(item, scales, { yField, colorField, group, barX, barWidth, dimensions })
}

/**
 * @param {Object} fields
 * @param {Object} options
 * @returns {{ xField: string, yField: string, groupField: string, colorField: string, dimensions: Object, padding: number }}
 */
function parseGroupedBarsConfig(fields, options) {
	const opts = options || {}
	return {
		xField: fields.x,
		yField: fields.y,
		groupField: fields.group,
		colorField: fields.color !== undefined ? fields.color : fields.group,
		dimensions: opts.dimensions,
		padding: opts.padding !== undefined ? opts.padding : 0.1
	}
}

/**
 * Creates a grouped bars layout
 *
 * @param {Array} data - Chart data
 * @param {Object} fields - Field mappings
 * @param {Object} scales - Chart scales
 * @param {Object} options - Options including dimensions and padding
 * @param {Object} options.dimensions - Chart dimensions
 * @param {number} [options.padding=0.1] - Padding between bars in a group
 * @returns {Object} Grouped bar data
 */
export function createGroupedBars(data, fields, scales, options) {
	if (!data || !data.length || !fields.group) return { groups: [], bars: [] }

	const { xField, yField, groupField, colorField, dimensions, padding } =
		parseGroupedBarsConfig(fields, options)

	const groups = [...new SvelteSet(data.map((d) => d[groupField]))]
	const xValues = [...new SvelteSet(data.map((d) => d[xField]))]

	const xScale = scales.x
	const groupWidth = xScale.bandwidth ? xScale.bandwidth() : 20
	const barWidth = (groupWidth - padding * (groups.length - 1)) / groups.length

	const bars = []
	xValues.forEach((xValue) => {
		const groupItems = data.filter((d) => d[xField] === xValue)
		const xPos = xScale(xValue)
		groups.forEach((group, i) => {
			const ctx = { groupItems, groupField, group, i, yField, colorField, barWidth, padding, dimensions, xPos }
			const bar = buildOneGroupBar(scales, ctx)
			if (bar) bars.push(bar)
		})
	})

	return { groups, bars }
}
