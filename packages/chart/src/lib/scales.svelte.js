import { scaleBand, scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { min, max } from 'd3-array'

/**
 * Creates appropriate scales based on data and dimensions
 *
 * @param {Array} data The dataset
 * @param {string} xKey Field to use for x-axis
 * @param {string} yKey Field to use for y-axis
 * @param {Object} dimensions Chart dimensions
 * @param {Object} options Additional options
 * @returns {Object} Object containing xScale, yScale, and colorScale
 */
export function createScales(data, xKey, yKey, dimensions, options = {}) {
	if (!data || data.length === 0) return {}

	const { colorKey = null, padding = 0.2 } = options

	// Determine if x values are numeric, dates, or categorical
	const xValues = data.map((d) => d[xKey])
	const xIsDate = xValues.some((v) => v instanceof Date)
	const xIsNumeric = !xIsDate && xValues.every((v) => !isNaN(parseFloat(v)))

	// Create x-scale based on data type
	let xScale
	if (xIsDate) {
		xScale = scaleTime()
			.domain([min(xValues), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	} else if (xIsNumeric) {
		xScale = scaleLinear()
			.domain([min([0, ...xValues]), max(xValues)])
			.range([0, dimensions.innerWidth])
			.nice()
	} else {
		xScale = scaleBand().domain(xValues).range([0, dimensions.innerWidth]).padding(padding)
	}

	// Create y-scale
	const yValues = data.map((d) => d[yKey])
	const yScale = scaleLinear()
		.domain([0, max(yValues) * 1.1]) // Add 10% padding on top
		.nice()
		.range([dimensions.innerHeight, 0])

	// Create color scale if colorKey is provided
	let colorScale = null
	if (colorKey) {
		const uniqueCategories = [...new Set(data.map((d) => d[colorKey]))]
		colorScale = scaleOrdinal().domain(uniqueCategories).range(schemeCategory10)
	}

	return { xScale, yScale, colorScale }
}

/**
 * Calculates the actual chart dimensions after applying margins
 *
 * @param {Object} dimensions Original dimensions
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
	let ticks = []
	let offset = 0

	// Calculate default count based on available space
	if (!count) {
		count = Math.abs((maxRange - minRange) / (fontSize * (axis === 'y' ? 3 : 6)))
	}

	// Get ticks based on scale type
	if (scale.ticks) {
		ticks = scale.ticks(Math.round(count))
	} else {
		offset = scale.bandwidth() / 2
		count = Math.min(Math.round(count), scale.domain().length)

		ticks = scale.domain()
		if (count < scale.domain().length) {
			const step = Math.ceil(scale.domain().length / count)
			ticks = ticks.filter((_, i) => i % step === 0)
		}
	}

	// Format ticks with positions
	return ticks.map((t) => ({
		value: t,
		position: scale(t) + (axis === 'x' ? offset : 0)
	}))
}
