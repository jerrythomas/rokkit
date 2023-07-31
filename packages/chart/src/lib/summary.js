import { sum, median, max, mean, min, quantile, cumsum } from 'd3-array'
import { nest } from 'd3-collection'
import { pick, flatten } from 'ramda'

export const aggregate = {
	count: (values) => values.length,
	sum: (values) => sum(values),
	min: (values) => min(values),
	max: (values) => max(values),
	mean: (values) => mean(values),
	median: (values) => median(values),
	cumsum: (values) => cumsum(values),
	q1: (values) => quantile(values, 0.25),
	q3: (values) => quantile(values, 0.75)
}

export function summarize(data, by, attr, stat = 'count') {
	const stats = Array.isArray(stat) ? stat : [stat]
	const grouped = nest()
		.key((d) => by.map((f) => d[f]).join('|'))
		.rollup((rows) => {
			let agg = pick(by, rows[0])
			stats.map(
				(stat) => (agg[stat] = aggregate[stat](rows.map((d) => d[attr])))
			)
			return [agg]
		})
		.entries(data)
	return flatten(grouped.map((group) => group.value))
}
