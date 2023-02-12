// import { sum, median, max, mean, min, quantile, cumsum } from 'd3-array'
// import { nest } from 'd3-collection'
// import { pick, flatten } from 'ramda'

// const aggregate = {
// 	count: (values) => values.length,
// 	sum: (values) => sum(values),
// 	min: (values) => min(values),
// 	max: (values) => max(values),
// 	mean: (values) => mean(values),
// 	median: (values) => median(values),
// 	q1: (values) => quantile(values, 0.25),
// 	q3: (values) => quantile(values, 0.75),
// }

// export function summarize(data, by, attr, stat = 'count') {
// 	const stats = Array.isArray(stat) ? stat : [stat]
// 	const grouped = nest()
// 		.key((d) => by.map((f) => d[f]).join('|'))
// 		.rollup((rows) => {
// 			let agg = pick(by, rows[0])
// 			stats.map(
// 				(stat) => (agg[stat] = aggregate[stat](rows.map((d) => d[attr])))
// 			)
// 			return [agg]
// 		})
// 		.entries(data)
// 	return flatten(grouped.map((group) => group.value))
// }

// export function getUniques(input, aes) {
// 	const attrs = ['x', 'y', 'fill']
// 	let values = {}

// 	attrs.map((attr) => {
// 		if (attr in aes) {
// 			values[attr] = [...new Set(input.map((d) => d[aes[attr]]))]
// 		}
// 	})
// 	// 	x: 'x' in aes ? [...new Set(input.map((d) => d[aes.x]))] : [],
// 	// 	y: 'y' in aes ? [...new Set(input.map((d) => d[aes.y]))] : [],
// 	// 	fill: 'fill' in aes ? [...new Set(input.map((d) => d[aes.fill]))] : [],
// 	// }
// 	return values
// }

// export function fillMissing(fill, rows, key, aes) {
// 	const filled = fill.map((f) => {
// 		let matched = rows.filter((r) => r[aes.fill] === f)
// 		if (matched.length == 0) {
// 			let row = {}
// 			row[key] = rows[0][key]
// 			row[aes.fill] = f
// 			row[aes.stat] = 0
// 			return row
// 		} else {
// 			return matched[0]
// 		}
// 	})
// 	return filled
// }

// export function convertToPhases(input, aes) {
// 	const uniques = getUniques(input, aes)
// 	let vertical = 'y' in uniques && uniques.y.some(isNaN)
// 	const horizontal = 'x' in uniques && uniques.x.some(isNaN)

// 	let summary = []

// 	if (horizontal && vertical) {
// 		if ((aes.stat || 'count') === 'count') {
// 			vertical = false
// 			console.warn('Assuming horizontal layout becuse stat is count')
// 		} else {
// 			console.error(
// 				'cannot plot without at least one axis having numeric values'
// 			)
// 			return { uniques, vertical }
// 		}
// 	}

// 	const key = vertical ? aes.y : aes.x
// 	const value = vertical ? aes.x : aes.y

// 	let by = [key]
// 	if ('fill' in aes) {
// 		by.push(aes.fill)
// 	}
// 	summary = summarize(input, by, value, aes.stat)
// 	const phases = nest()
// 		.key((d) => d[key])
// 		.rollup((rows) => {
// 			return 'fill' in aes ? fillMissing(uniques.fill, rows, key, aes) : rows
// 		})
// 		.entries(summary)

// 	return { phases, uniques, vertical }
// }

// export function mirror(input, aes) {
// 	let domain = 0

// 	const stats = input.phases.map((phase) => {
// 		const stat = cumsum(phase.value.map((row) => row[aes.stat]))
// 		const midpoint = max(stat) / 2
// 		domain = Math.max(domain, midpoint)

// 		const rows = phase.value.map((row, index) => {
// 			if (input.vertical) {
// 				return {
// 					...row,
// 					y: input.uniques.y.indexOf(row[aes.y]),
// 					x1: stat[index] - midpoint,
// 					x0: stat[index] - midpoint - row[aes.stat],
// 				}
// 			} else {
// 				return {
// 					...row,
// 					x: input.uniques.x.indexOf(row[aes.x]),
// 					y1: stat[index] - midpoint,
// 					y0: stat[index] - midpoint - row[aes.stat],
// 				}
// 			}
// 		})
// 		phase.value = rows
// 		return phase
// 	})
// 	return { ...input, stats }
// }

// export function funnel(input, aes) {
// 	let data = convertToPhases(input, aes)
// 	data = mirror(data, aes)
// 	// console.log(data)

// 	if ('fill' in aes) {
// 		let stats = flatten(data.stats.map((phase) => phase.value))
// 		// console.log(stats)
// 		data.stats = nest()
// 			.key((d) => d[aes.fill])
// 			.rollup((rows) => [...rows, { ...rows[rows.length - 1], x: rows.length }])
// 			.entries(stats)
// 	}
// 	return data
// }
