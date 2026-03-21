import { scaleBand, scaleLinear, scaleTime } from 'd3-scale'
import { min, max } from 'd3-array'

/**
 * Builds an appropriate D3 x-axis scale based on value types.
 * Returns scaleTime for Date values, scaleLinear for numeric values,
 * or scaleBand for categorical values.
 *
 * @param {Array} xValues
 * @param {Object} dimensions
 * @param {number} padding
 * @returns {import('d3-scale').ScaleContinuousNumeric|import('d3-scale').ScaleBand}
 */
export function buildXScale(xValues, dimensions, padding) {
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
