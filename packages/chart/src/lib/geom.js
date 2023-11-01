import { sum, min, max, mean, mode, median, deviation, variance, flatRollup } from 'd3-array'

const summaries = {
	identity: (value) => value,
	count: (values) => values.length,
	sum: (values) => sum(values),
	min: (values) => min(values),
	max: (values) => max(values),
	mean: (values) => mean(values),
	median: (values) => median(values),
	mode: (values) => mode(values),
	variance: (values) => variance(values),
	deviation: (values) => deviation(values)
}

/**
 * Returns an aggregator function for an input string or function.
 *
 * @param {string|function} stat
 * @returns
 */
export function rollup(stat) {
	if (typeof stat === 'function') return stat
	if (typeof stat !== 'string') throw new TypeError('stat must be a string or function')
	if (!(stat in summaries)) throw new TypeError('Unknown stat: ' + stat)

	return summaries[stat]
}

/**
 * Aesthetics for a chart.
 *
 * @typedef Aesthetics
 * @property {string} x
 * @property {string} y
 * @property {string} [fill]
 * @property {string} [size]
 * @property {string} [color]
 * @property {string} [shape]
 * @property {string} [pattern]
 */

/**
 *
 * @param {Array<any>} data
 * @param {Aesthetics} aes
 * @param {function|string} stat
 * @returns
 */
export function aggregate(data, aes, stat = 'identity') {
	const agg = rollup(stat)
	const keys = ['color', 'fill', 'pattern', 'shape', 'size'].filter((k) =>
		Object.keys(aes).includes(k)
	)

	let groups = keys.map((k) => (d) => d[aes[k]])

	return flatRollup(
		data,
		(v) => agg(v.map((d) => d[aes.y])),
		(d) => d[aes.x],
		...groups
	)
}

// export function geomBars(chart, aes) {
// 	const { x, y, fill, color, pattern } = { ...aes, ...chart.aes }
// 	return aggregate(chart.data, { x, y, fill, color, pattern })
// }

// export function geomLines(chart, aes) {
// 	const { x, y, color } = { ...aes, ...chart.aes }
// 	return aggregate(chart.data, { x, y, color })
// }

// export function geomViolin(chart, aes) {
// 	const { x, y, fill, color, pattern } = { ...aes, ...chart.aes }
// 	return { x, y, fill, color, pattern, ...opts }
// }

// export function geomArea(chart, aes) {
// 	const { x, y, fill, color, pattern } = { ...aes, ...chart.aes }
// 	return { x, y, fill, color, pattern, ...opts }
// }

// export function geomTrend(chart, aes) {
// 	const { x, y, fill, color, pattern } = { ...aes, ...chart.aes }
// 	return { x, y, fill, color, pattern, ...opts }
// }

// export function geomPoints(chart, aes) {
// 	const { x, y, fill, color, shape, size } = { ...aes, ...chart.aes }
// 	return { x, y, fill, color, shape, size, ...opts }
// }

// export function violin(data, mapping) {}
// export function bar(data, mapping) {}
// export function scatter(data, mapping) {}
// export function line(data, mapping) {}
