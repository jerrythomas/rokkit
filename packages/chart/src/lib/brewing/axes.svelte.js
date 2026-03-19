// import { scaleBand } from 'd3-scale'

import {} from './types.js'

/**
 * @typedef {import('./types').TickData} TickData
 * @typedef {import('./types').AxisData} AxisData
 * @typedef {import('./types').ChartScales} ChartScales
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

const IDENTITY = (v) => v

/**
 * @param {Object} xScale
 * @param {number|null} tickCount
 * @returns {Array}
 */
function xTicksFromContinuous(xScale, tickCount) {
	return tickCount !== null ? xScale.ticks(tickCount) : xScale.ticks()
}

/**
 * @param {Array} domain
 * @param {number} tickCount
 * @returns {Array}
 */
function downsampleDomain(domain, tickCount) {
	const step = Math.max(1, Math.floor(domain.length / tickCount))
	return domain.filter((_, i) => i % step === 0)
}

/**
 * @param {Object} xScale
 * @param {number|null} tickCount
 * @returns {Array}
 */
function xTicksFromBand(xScale, tickCount) {
	const domain = xScale.domain()
	if (tickCount === null || tickCount >= domain.length) return domain
	return downsampleDomain(domain, tickCount)
}

/**
 * @param {Object} xScale
 * @param {number|null} tickCount
 * @returns {Array}
 */
function resolveXTicks(xScale, tickCount) {
	return xScale.ticks ? xTicksFromContinuous(xScale, tickCount) : xTicksFromBand(xScale, tickCount)
}

/**
 * @param {Object} xScale
 * @param {unknown} value
 * @returns {number}
 */
function xPosition(xScale, value) {
	return xScale.bandwidth ? xScale(value) + xScale.bandwidth() / 2 : xScale(value)
}

/**
 * @param {Object} scale
 * @param {Array} values
 * @param {Function} formatter
 * @param {(scale: Object, v: unknown) => number} getPosition
 * @returns {Array}
 */
function mapTicks(scale, values, formatter, getPosition) {
	return values.map((value) => ({
		value,
		position: getPosition(scale, value),
		formattedValue: formatter(value)
	}))
}

/**
 * @param {Object} options
 * @returns {{ tickCount: number|null, formatter: Function, label: string }}
 */
function parseAxisOptions(options) {
	const opts = options || {}
	return {
		tickCount: opts.tickCount !== undefined ? opts.tickCount : null,
		formatter: opts.tickFormat ? opts.tickFormat : IDENTITY,
		label: opts.label ? opts.label : ''
	}
}

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
export function createXAxis(scales, dimensions, options) {
	if (!scales.x) return { ticks: [] }
	const { tickCount, formatter, label } = parseAxisOptions(options)
	const ticks = mapTicks(scales.x, resolveXTicks(scales.x, tickCount), formatter, xPosition)
	return {
		ticks,
		label,
		transform: `translate(0, ${dimensions.innerHeight})`,
		labelTransform: `translate(${dimensions.innerWidth / 2}, 35)`
	}
}

/**
 * @param {Object} yScale
 * @param {number|null} tickCount
 * @returns {Array}
 */
function yTicksFromDomain(yScale, tickCount) {
	const domain = yScale.domain()
	if (tickCount === null || domain.length <= tickCount) return domain
	return downsampleDomain(domain, tickCount)
}

/**
 * @param {Object} yScale
 * @param {number|null} tickCount
 * @returns {Array}
 */
function resolveYTicks(yScale, tickCount) {
	if (yScale.ticks) return tickCount !== null ? yScale.ticks(tickCount) : yScale.ticks()
	if (yScale.domain) return yTicksFromDomain(yScale, tickCount)
	return []
}

/**
 * @param {Object} scale
 * @param {unknown} value
 * @returns {unknown}
 */
function yPositionPassthrough(scale, value) {
	return scale(value)
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
export function createYAxis(scales, dimensions, options) {
	if (!scales.y) return { ticks: [] }
	const { tickCount, formatter, label } = parseAxisOptions(options)
	const ticks = mapTicks(
		scales.y,
		resolveYTicks(scales.y, tickCount),
		formatter,
		yPositionPassthrough
	)
	return {
		ticks,
		label,
		transform: 'translate(0, 0)',
		labelTransform: `translate(-40, ${dimensions.innerHeight / 2}) rotate(-90)`
	}
}

/**
 * @param {Object} scales
 * @param {Object} dimensions
 * @param {number|null} xTickCount
 * @returns {Array}
 */
function buildXLines(scales, dimensions, xTickCount) {
	return createXAxis(scales, dimensions, { tickCount: xTickCount }).ticks.map((tick) => ({
		x1: tick.position,
		y1: 0,
		x2: tick.position,
		y2: dimensions.innerHeight
	}))
}

/**
 * @param {Object} scales
 * @param {Object} dimensions
 * @param {number|null} yTickCount
 * @returns {Array}
 */
function buildYLines(scales, dimensions, yTickCount) {
	return createYAxis(scales, dimensions, { tickCount: yTickCount }).ticks.map((tick) => ({
		x1: 0,
		y1: tick.position,
		x2: dimensions.innerWidth,
		y2: tick.position
	}))
}

/**
 * @param {Object} opts
 * @returns {{ direction: string, xTickCount: number|null, yTickCount: number|null }}
 */
function parseGridOptions(opts) {
	const o = opts || {}
	return {
		direction: o.direction !== undefined ? o.direction : 'both',
		xTickCount: o.xTickCount !== undefined ? o.xTickCount : null,
		yTickCount: o.yTickCount !== undefined ? o.yTickCount : null
	}
}

/**
 * @param {string} direction
 * @returns {{ showX: boolean, showY: boolean }}
 */
function gridDirections(direction) {
	return {
		showX: direction === 'x' || direction === 'both',
		showY: direction === 'y' || direction === 'both'
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
export function createGrid(scales, dimensions, options) {
	const { direction, xTickCount, yTickCount } = parseGridOptions(options)
	const { showX, showY } = gridDirections(direction)
	return {
		xLines: showX && scales.x ? buildXLines(scales, dimensions, xTickCount) : [],
		yLines: showY && scales.y ? buildYLines(scales, dimensions, yTickCount) : []
	}
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
