import { max, cumsum } from 'd3-array'
import { nest } from 'd3-collection'
import { flatten } from 'ramda'
import { area, curveBasis, curveBumpX, curveBumpY } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import { summarize } from './summary'

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

/**
 * Determines if the layout is vertical based on the given parameters.
 * @param {Object} uniques - The unique values.
 * @param {Object} aes - The aes object.
 * @returns {boolean} - Returns true if the layout is vertical, false otherwise.
 */
function determineLayout(uniques, aes) {
	let vertical = 'y' in uniques && uniques.y.some(isNaN)
	const horizontal = 'x' in uniques && uniques.x.some(isNaN)

	if (horizontal && vertical) {
		if ((aes.stat || 'count') === 'count') {
			vertical = false
			console.warn('Assuming horizontal layout because stat is count')
		} else {
			console.error(
				'Cannot plot without at least one axis having numeric values'
			)
			return null
		}
	}
	return vertical
}

/**
 * Converts to phases.
 * @param {Array} input - The input data.
 * @param {Object} aes - The aes object.
 * @returns {Object} - The phases, uniques, and vertical properties.
 */
export function convertToPhases(input, aes) {
	const uniques = getUniques(input, aes)
	const vertical = determineLayout(uniques, aes)
	if (vertical === null) return { uniques, vertical }

	const key = vertical ? aes.y : aes.x
	const value = vertical ? aes.x : aes.y

	let by = [key]
	if ('fill' in aes) by.push(aes.fill)

	const summary = summarize(input, by, value, aes.stat)
	const phases = nest()
		.key((d) => d[key])
		.rollup((rows) =>
			'fill' in aes ? fillMissing(uniques.fill, rows, key, aes) : rows
		)
		.entries(summary)

	return { phases, uniques, vertical }
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

/**
 * Mirrors the input based on the provided aesthetic mappings.
 *
 * @param {Object} input - The input data with phases and uniques.
 * @param {Object} aes - The aesthetic mappings.
 * @returns {Object} The mirrored input with updated stats and domain.
 */
export function mirror(input, aes) {
	const domain = calculateDomain(input)
	const stats = calculateStats(input, aes, domain)

	return { ...input, stats, domain }
}

/**
 * Calculates the domain for the mirror operation.
 *
 * @param {Object} input - The input data with phases.
 * @returns {number} The calculated domain.
 */
function calculateDomain(input) {
	return input.phases.reduce((maxDomain, phase) => {
		const stat = cumsum(phase.value.map((row) => row[aes.stat]))
		const midpoint = max(stat) / 2
		return Math.max(maxDomain, midpoint)
	}, 0)
}

/**
 * Calculates the stats for the mirror operation.
 *
 * @param {Object} input - The input data with phases and uniques.
 * @param {Object} aes - The aesthetic mappings.
 * @param {number} domain - The domain for the mirror operation.
 * @returns {Array} The calculated stats.
 */
function calculateStats(input, aes, domain) {
	return input.phases.map((phase) => {
		const stat = cumsum(phase.value.map((row) => row[aes.stat]))
		const midpoint = max(stat) / 2

		phase.value = phase.value.map((row, index) => {
			const position = calculatePosition(input, aes, row, stat, index, midpoint)
			return { ...row, ...position }
		})

		return phase
	})
}

/**
 * Calculates the position for the mirror operation.
 *
 * @param {Object} input - The input data with uniques.
 * @param {Object} aes - The aesthetic mappings.
 * @param {Object} row - The current row.
 * @param {Array} stat - The stat data.
 * @param {number} index - The current index.
 * @param {number} midpoint - The midpoint for the mirror operation.
 * @returns {Object} The calculated position.
 */
function calculatePosition(input, aes, row, stat, index, midpoint) {
	const axis = input.vertical ? 'y' : 'x'
	const oppositeAxis = input.vertical ? 'x' : 'y'
	const axisValue = input.uniques[axis].indexOf(row[aes[axis]])
	const position1 = stat[index] - midpoint
	const position0 = position1 - row[aes.stat]

	return {
		[axis]: axisValue,
		[`${oppositeAxis}1`]: position1,
		[`${oppositeAxis}0`]: position0
	}
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
