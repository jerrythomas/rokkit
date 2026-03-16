import { SvelteSet } from 'svelte/reactivity'
import { scaleBand, scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { min, max } from 'd3-array'

/**
 * @param {Array} xValues
 * @param {Object} dimensions
 * @param {number} padding
 * @returns {Object}
 */
function buildXScale(xValues, dimensions, padding) {
	const xIsDate = xValues.some((v) => v instanceof Date)
	const xIsNumeric = !xIsDate && xValues.every((v) => !isNaN(parseFloat(v)))

	if (xIsDate) {
		return scaleTime()
			.domain([min(xValues), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	}
	if (xIsNumeric) {
		return scaleLinear()
			.domain([min([0, ...xValues]), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	}
	return scaleBand().domain(xValues).range([0, dimensions.innerWidth]).padding(padding)
}

/**
 * Creates appropriate scales based on data and dimensions
 *
 * @param {Array} data The dataset
 * @param {Object} dimensions Chart dimensions
 * @param {Object} options Additional options
 * @param {string} options.xKey Field to use for x-axis
 * @param {string} options.yKey Field to use for y-axis
 * @param {string} [options.colorKey] Field to use for color mapping
 * @param {number} [options.padding=0.2] Padding for band scales
 * @returns {Object} Object containing xScale, yScale, and colorScale
 */
/**
 * @param {Array} data
 * @param {string} colorKey
 * @returns {Object}
 */
function buildColorScale(data, colorKey) {
	const uniqueCategories = [...new SvelteSet(data.map((d) => d[colorKey]))]
	return scaleOrdinal().domain(uniqueCategories).range(schemeCategory10)
}

/**
 * @param {Object} options
 * @returns {{ xKey: string, yKey: string, colorKey: string|undefined, padding: number }}
 */
function parseScaleOptions(options) {
	const opts = options || {}
	return {
		xKey: opts.xKey,
		yKey: opts.yKey,
		colorKey: opts.colorKey,
		padding: opts.padding !== undefined ? opts.padding : 0.2
	}
}

export function createScales(data, dimensions, options) {
	if (!data || !data.length) return {}

	const { xKey, yKey, colorKey, padding } = parseScaleOptions(options)
	const xValues = data.map((d) => d[xKey])
	const yValues = data.map((d) => d[yKey])
	const colorScale = colorKey ? buildColorScale(data, colorKey) : null

	return {
		xScale: buildXScale(xValues, dimensions, padding),
		yScale: scaleLinear().domain([0, max(yValues) * 1.1]).nice().range([dimensions.innerHeight, 0]),
		colorScale
	}
}

/**
 * Calculates the actual chart dimensions after applying margins
 *
 * @param {number} width
 * @param {number} height
 * @param {Object} margin
 * @returns {Object} Dimensions with calculated inner width and height
 */
export function calculateChartDimensions(width, height, margin) {
	return {
		width,
		height,
		margin,
		innerWidth: width - margin.left - margin.right,
		innerHeight: height - margin.top - margin.bottom
	}
}

/**
 * Gets the axis origin value
 *
 * @param {Object} scale D3 scale
 * @returns {number} Origin value
 */
export function getOriginValue(scale) {
	return scale.ticks ? scale(Math.max(0, min(scale.domain()))) : scale.range()[0]
}

/**
 * Resolve tick values for a band scale, applying downsampling when needed
 * @param {Object} scale
 * @param {number} count
 * @returns {{ ticks: Array, offset: number }}
 */
function bandTicks(scale, count) {
	const offset = scale.bandwidth() / 2
	const domain = scale.domain()
	const cappedCount = Math.min(Math.round(count), domain.length)
	const step = Math.ceil(domain.length / cappedCount)
	const ticks = cappedCount < domain.length ? domain.filter((_, i) => i % step === 0) : domain
	return { ticks, offset }
}

/**
 * @param {number} rangeSize
 * @param {string} axis
 * @param {number} fontSize
 * @returns {number}
 */
function defaultTickCount(rangeSize, axis, fontSize) {
	const divisor = fontSize * (axis === 'y' ? 3 : 6)
	return Math.abs(rangeSize / divisor)
}

/**
 * @param {Array} ticks
 * @param {Object} scale
 * @param {number} offset
 * @param {boolean} isXAxis
 * @returns {Array}
 */
function formatTicks(ticks, scale, offset, isXAxis) {
	const pos = isXAxis ? offset : 0
	return ticks.map((t) => ({ value: t, position: scale(t) + pos }))
}

/**
 * Creates axis ticks
 *
 * @param {Object} scale D3 scale
 * @param {string} axis Axis type ('x' or 'y')
 * @param {number} count Number of ticks
 * @param {number} fontSize Font size for determining tick density
 * @returns {Array} Array of tick objects
 */
export function createTicks(scale, axis, count = null, fontSize = 12) {
	const [minRange, maxRange] = scale.range()
	const tickCount = count ?? defaultTickCount(maxRange - minRange, axis, fontSize)

	let ticks, offset
	if (scale.ticks) {
		ticks = scale.ticks(Math.round(tickCount))
		offset = 0
	} else {
		const band = bandTicks(scale, tickCount)
		ticks = band.ticks
		offset = band.offset
	}

	return formatTicks(ticks, scale, offset, axis === 'x')
}
