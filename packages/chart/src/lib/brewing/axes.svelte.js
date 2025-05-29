import { scaleBand } from 'd3-scale'

import {} from './types.js'

/**
 * @typedef {import('./types').TickData} TickData
 * @typedef {import('./types').AxisData} AxisData
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * Creates x-axis tick data for rendering
 *
 * @param {Object} scales - Chart scales
 * @param {Function} scales.x - X-axis scale
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Axis options
 * @param {number} [options.tickCount] - Number of ticks to show
 * @param {Function} [options.tickFormat] - Tick formatting function
 * @param {string} [options.label] - Axis label
 * @returns {AxisData} Axis rendering data
 */
export function createXAxis(scales, dimensions, options = {}) {
	if (!scales.x) return { ticks: [] }

	const { tickCount = null, tickFormat = null, label = '' } = options
	const xScale = scales.x

	// Determine tick values
	let tickValues
	if (xScale.ticks) {
		// For continuous scales (linear, time)
		tickValues = tickCount !== null ? xScale.ticks(tickCount) : xScale.ticks()
	} else {
		// For band scales
		tickValues = xScale.domain()
		if (tickCount !== null && tickCount < tickValues.length) {
			const step = Math.max(1, Math.floor(tickValues.length / tickCount))
			tickValues = tickValues.filter((_, i) => i % step === 0)
		}
	}

	// Format ticks
	const formatter = tickFormat || ((v) => v)

	// Generate tick data
	const ticks = tickValues.map((value) => {
		const position = xScale.bandwidth ? xScale(value) + xScale.bandwidth() / 2 : xScale(value)

		return {
			value,
			position,
			formattedValue: formatter(value)
		}
	})

	return {
		ticks,
		label,
		transform: `translate(0, ${dimensions.innerHeight})`,
		labelTransform: `translate(${dimensions.innerWidth / 2}, 35)`
	}
}

/**
 * Creates y-axis tick data for rendering
 *
 * @param {Object} scales - Chart scales
 * @param {Function} scales.y - Y-axis scale
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Axis options
 * @param {number} [options.tickCount] - Number of ticks to show
 * @param {Function} [options.tickFormat] - Tick formatting function
 * @param {string} [options.label] - Axis label
 * @returns {AxisData} Axis rendering data
 */
export function createYAxis(scales, dimensions, options = {}) {
	if (!scales.y) return { ticks: [] }

	const { tickCount = null, tickFormat = null, label = '' } = options
	const yScale = scales.y

	// Determine tick values
	let tickValues = []

	if (yScale.ticks) {
		tickValues = tickCount !== null ? yScale.ticks(tickCount) : yScale.ticks()
	} else if (yScale.domain) {
		tickValues = yScale.domain()
		if (tickCount !== null && tickValues.length > tickCount) {
			const step = Math.max(1, Math.floor(tickValues.length / tickCount))
			tickValues = tickValues.filter((_, i) => i % step === 0)
		}
	}

	// Format ticks
	const formatter = tickFormat || ((v) => v)

	// Generate tick data
	const ticks = tickValues.map((value) => ({
		value,
		position: yScale(value),
		formattedValue: formatter(value)
	}))

	return {
		ticks,
		label,
		transform: 'translate(0, 0)',
		labelTransform: `translate(-40, ${dimensions.innerHeight / 2}) rotate(-90)`
	}
}

/**
 * Creates grid line data for rendering
 *
 * @param {Object} scales - Chart scales
 * @param {Object} dimensions - Chart dimensions
 * @param {Object} options - Grid options
 * @param {string} [options.direction='both'] - Grid direction ('x', 'y', or 'both')
 * @param {number} [options.xTickCount] - Number of x-axis ticks
 * @param {number} [options.yTickCount] - Number of y-axis ticks
 * @returns {Object} Grid rendering data
 */
export function createGrid(scales, dimensions, options = {}) {
	const { direction = 'both', xTickCount = null, yTickCount = null } = options
	const result = { xLines: [], yLines: [] }

	// Generate X grid lines (vertical)
	if ((direction === 'x' || direction === 'both') && scales.x) {
		const xAxis = createXAxis(scales, dimensions, { tickCount: xTickCount })
		result.xLines = xAxis.ticks.map((tick) => ({
			x1: tick.position,
			y1: 0,
			x2: tick.position,
			y2: dimensions.innerHeight
		}))
	}

	// Generate Y grid lines (horizontal)
	if ((direction === 'y' || direction === 'both') && scales.y) {
		const yAxis = createYAxis(scales, dimensions, { tickCount: yTickCount })
		result.yLines = yAxis.ticks.map((tick) => ({
			x1: 0,
			y1: tick.position,
			x2: dimensions.innerWidth,
			y2: tick.position
		}))
	}

	return result
}

/**
 * Creates DOM attributes for a tick element
 *
 * @param {TickData} tick - Tick data
 * @param {string} axis - Axis type ('x' or 'y')
 * @returns {Object} Attributes for the tick
 */
export function createTickAttributes(tick, axis) {
	if (axis === 'x') {
		return {
			'data-plot-tick': 'major',
			transform: `translate(${tick.position}, 0)`,
			'text-anchor': 'middle'
		}
	} else {
		return {
			'data-plot-tick': 'major',
			transform: `translate(0, ${tick.position})`,
			'text-anchor': 'end',
			'dominant-baseline': 'middle'
		}
	}
}
