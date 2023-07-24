import { sum, median, max, mean, min, quantile, cumsum } from 'd3-array'
import { nest } from 'd3-collection'
import { pick, flatten } from 'ramda'
import { area, curveBasis, curveBumpX, curveBumpY } from 'd3-shape'
import { scaleLinear } from 'd3-scale'

const aggregate = {
	count: (values) => values.length,
	sum: (values) => sum(values),
	min: (values) => min(values),
	max: (values) => max(values),
	mean: (values) => mean(values),
	median: (values) => median(values),
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

export function getUniques(input, aes) {
	const attrs = ['x', 'y', 'fill']
	let values = {}

	attrs.map((attr) => {
		if (attr in aes) {
			values[attr] = [...new Set(input.map((d) => d[aes[attr]]))]
		}
	})
	return values
}

export function fillMissing(fill, rows, key, aes) {
	const filled = fill.map((f) => {
		let matched = rows.filter((r) => r[aes.fill] === f)
		if (matched.length == 0) {
			let row = {}
			row[key] = rows[0][key]
			row[aes.fill] = f
			row[aes.stat] = 0
			return row
		} else {
			return matched[0]
		}
	})
	return filled
}

export function convertToPhases(input, aes) {
	const uniques = getUniques(input, aes)
	let vertical = 'y' in uniques && uniques.y.some(isNaN)
	const horizontal = 'x' in uniques && uniques.x.some(isNaN)

	let summary = []

	if (horizontal && vertical) {
		if ((aes.stat || 'count') === 'count') {
			vertical = false
			console.warn('Assuming horizontal layout becuse stat is count')
		} else {
			console.error(
				'cannot plot without at least one axis having numeric values'
			)
			return { uniques, vertical }
		}
	}

	const key = vertical ? aes.y : aes.x
	const value = vertical ? aes.x : aes.y

	let by = [key]
	if ('fill' in aes) {
		by.push(aes.fill)
	}
	summary = summarize(input, by, value, aes.stat)
	const phases = nest()
		.key((d) => d[key])
		.rollup((rows) => {
			return 'fill' in aes ? fillMissing(uniques.fill, rows, key, aes) : rows
		})
		.entries(summary)

	return { phases, uniques, vertical }
}

export function mirror(input, aes) {
	let domain = 0

	const stats = input.phases.map((phase) => {
		const stat = cumsum(phase.value.map((row) => row[aes.stat]))
		const midpoint = max(stat) / 2
		domain = Math.max(domain, midpoint)

		const rows = phase.value.map((row, index) => {
			if (input.vertical) {
				return {
					...row,
					y: input.uniques.y.indexOf(row[aes.y]),
					x1: stat[index] - midpoint,
					x0: stat[index] - midpoint - row[aes.stat]
				}
			} else {
				return {
					...row,
					x: input.uniques.x.indexOf(row[aes.x]),
					y1: stat[index] - midpoint,
					y0: stat[index] - midpoint - row[aes.stat]
				}
			}
		})

		phase.value = rows
		return phase
	})

	return { ...input, stats, domain }
}

export function getScales(input, width, height) {
	let scale
	if (input.vertical) {
		scale = {
			x: scaleLinear()
				.domain([-input.domain * 1.4, input.domain * 1.4])
				.range([0, width]),
			y: scaleLinear().domain([0, input.uniques.y.length]).range([0, height])
		}
	} else {
		scale = {
			x: scaleLinear().domain([0, input.uniques.x.length]).range([0, width]),
			y: scaleLinear()
				.domain([-input.domain, input.domain * 1.4])
				.range([height - 20, 0])
		}
	}
	return scale
}

function getLabels(data) {
	let key = data.vertical ? 'y' : 'x'
	let opp = key === 'x' ? 'y' : 'x'

	let labels = data.uniques[key].map((label, index) => {
		let row = { label }
		let domain = data.scale[opp].domain()
		row[`${key}1`] = row[`${key}2`] = data.scale[key](index + 1)
		row[`${opp}1`] = data.scale[opp](domain[0])
		row[`${opp}2`] = data.scale[opp](domain[1])
		row[opp] = 20
		row[key] = data.scale[key](index) + 20
		return row
	})
	return labels
}

export function getPaths(vertical, scale, curve) {
	return vertical
		? area()
				.x0((d) => scale.x(d.x0))
				.x1((d) => scale.x(d.x1))
				.y((d) => scale.y(d.y))
				.curve(curve)
		: area()
				.x((d) => scale.x(d.x))
				.y0((d) => scale.y(d.y0))
				.y1((d) => scale.y(d.y1))
				.curve(curve)
}
export function funnel(input, aes, width, height) {
	let data = convertToPhases(input, aes)
	data = mirror(data, aes)
	const curve =
		aes.curve === 'basis' ? curveBasis : data.vertical ? curveBumpY : curveBumpX

	if ('fill' in aes) {
		let stats = flatten(data.stats.map((phase) => phase.value))

		data.stats = nest()
			.key((d) => d[aes.fill])
			.rollup((rows) => {
				let last = data.vertical ? { y: rows.length } : { x: rows.length }
				return [...rows, { ...rows[rows.length - 1], ...last }]
			})
			.entries(stats)
	}
	data.scale = getScales(data, width, height)
	data.path = getPaths(data.vertical, data.scale, curve)
	data.labels = getLabels(data)
	return data
}
