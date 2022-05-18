import { flatGroup } from 'd3-array'
import { nest } from 'd3-collection'
import { ascending } from 'd3-array'
import { pipe, map, pick, omit, uniq, mergeLeft, difference } from 'ramda'

export function tweenable() {
	let nestBy
	let sortOrder = ascending
	let groupBy = []
	let valueField
	let combinations
	let combiCounts
	let missingRows

	let f = {
		key: (k) => {
			nestBy = k
			return f
		},
		sort: (order) => {
			sortOrder = order
			return f
		},
		group: (fields) => {
			groupBy = [...new Set(fields)]
			return f
		},
		value: (field) => {
			valueField = field
			return f
		},
		apply: (input) => {
			let data = input

			if ((groupBy.length || nestBy) && valueField) {
				const fields = nestBy ? [nestBy] : []
				data = flatObjectGroup(input, [...fields, ...groupBy], valueField)
			}

			if (nestBy) {
				let fields = [...groupBy, nestBy, valueField]
				combinations = pipe(map(pick(groupBy)), uniq)(input)
				combiCounts = combinations
					.map((d) => JSON.stringify(d))
					.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})

				missingRows = pipe(
					map(pick(groupBy)),
					uniq,
					difference(combinations),
					map(mergeLeft({ [valueField]: [] }))
				)

				data = nest()
					.key((d) => d[nestBy])
					.sortKeys(sortOrder)
					.rollup((values) => values.map(omit([nestBy])))
					.entries(data.map(pick(fields)))

				data.map((d) =>
					d.value.map((x) => {
						const key = JSON.stringify(pick(groupBy, x))
						combiCounts[key] = Math.max(combiCounts[key], x[valueField].length)
					})
				)

				data = data.map(({ key, value }) => ({
					key,
					value: addHiddenValues(
						value,
						missingRows,
						combiCounts,
						valueField,
						groupBy
					)
				}))
			}
			return data
		}
	}

	return f
}

function addHiddenValues(values, missingRows, counts, valueField, groupBy) {
	const dummy = { y: 0, tweenVisibility: 0 }
	const result = [...values, ...missingRows(values)].map((item) => {
		const key = JSON.stringify(pick(groupBy, item))
		const diff = counts[key] - item[valueField].length
		item[valueField] = [...item[valueField], ...Array(diff).fill(dummy)]
		return item
	})

	return result
}
/**
 *
 * @param {Array} array
 * @param {Array} fields
 * @param {String} y
 * @returns a flat grouped object array
 */
function flatObjectGroup(data, fields, y) {
	const attr = fields.map((x) => (d) => d[x])
	const keys = [...fields, y]
	let grouped = flatGroup(data, ...attr)
		.map((x) =>
			x.reduce((acc, item, index) => ({ ...acc, [keys[index]]: item }), {})
		)
		.map((d) => ({
			...d,
			[y]: d[y].map((v) => ({ y: v[y], tweenVisibility: 1 }))
		}))

	return grouped
}

function evaluate(input, groupBy) {
	const groups = pipe(map(pick(groupBy)), uniq)(input)
	const groupCounts = groups
		.map(JSON.stringify())
		.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})

	const missingRows = pipe(
		map(pick(groupBy)),
		uniq,
		difference(combinations),
		map(mergeLeft({ [valueField]: [] }))
	)

	return { groups, groupCounts, missingRows }
}
