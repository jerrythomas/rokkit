import { sum, mean, min, max, quantile, ascending } from 'd3-array'
import { dataset } from '@rokkit/data'

function sortedQuantile(values, p) {
	return quantile([...values].sort(ascending), p)
}

/**
 * Tukey whisker bounds for a group of numeric values.
 * Whiskers clamp to the most extreme datum within the 1.5·IQR fence;
 * values outside the fence are outliers.
 *
 * @param {number[]} values
 * @returns {{ min: number, max: number, outliers: number[] }}
 */
function whiskerBounds(values) {
	const q1 = sortedQuantile(values, 0.25)
	const q3 = sortedQuantile(values, 0.75)
	const iqr = q3 - q1
	const lo = q1 - 1.5 * iqr
	const hi = q3 + 1.5 * iqr
	const within = values.filter((v) => v >= lo && v <= hi)
	return {
		min: within.length ? min(within) : q1,
		max: within.length ? max(within) : q3,
		outliers: values.filter((v) => v < lo || v > hi)
	}
}

/**
 * Built-in reduction functions. Each receives an array of numeric values.
 * @type {Record<string, (values: number[]) => number>}
 */
export const STAT_FNS = {
	sum,
	mean,
	min,
	max,
	count: (values) => values.length
}

/**
 * Computes box plot quartile statistics grouped by x (and optionally color).
 * Output rows have { q1, median, q3, iqr_min, iqr_max, outliers } replacing the raw y values.
 * iqr_min/iqr_max are Tukey-clamped whisker endpoints (most extreme datum within
 * the 1.5·IQR fence); outliers holds values outside the fence.
 *
 * @param {Object[]} data
 * @param {{ x?: string, y?: string, color?: string }} channels
 * @returns {Object[]}
 */
export function applyBoxStat(data, channels) {
	const { x: xf, y: yf, color: cf } = channels
	if (!xf || !yf) return data
	const by = [xf, cf].filter(Boolean)
	return dataset(data)
		.groupBy(...by)
		.summarize((row) => row[yf], {
			q1: (v) => sortedQuantile(v, 0.25),
			median: (v) => sortedQuantile(v, 0.5),
			q3: (v) => sortedQuantile(v, 0.75),
			iqr_min: (v) => whiskerBounds(v).min,
			iqr_max: (v) => whiskerBounds(v).max,
			outliers: (v) => whiskerBounds(v).outliers
		})
		.rollup()
		.select()
}

/**
 * Aggregates data by one or more grouping fields, reducing the value field
 * using the given stat. Accepts a built-in name or a custom function.
 *
 * @param {Object[]} data
 * @param {{ by: string[], value: string, stat: string|Function }} opts
 * @returns {Object[]}
 */
function isIdentityOrEmpty(stat, by, value) {
	return stat === 'identity' || by.length === 0 || value === null || value === undefined
}

export function applyAggregate(data, { by, value, stat }) {
	if (isIdentityOrEmpty(stat, by, value)) return data
	const fn = typeof stat === 'function' ? stat : STAT_FNS[stat]
	if (fn === null || fn === undefined) return data
	return dataset(data)
		.groupBy(...by)
		.summarize((row) => row[value], { [value]: fn })
		.rollup()
		.select()
}
