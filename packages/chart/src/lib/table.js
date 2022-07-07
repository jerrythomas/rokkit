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
	const dummy = { y: 0, isTweenHidden: true }

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

			if (groupBy.length && valueField) {
				const fields = nestBy ? [nestBy] : []
				data = flatObjectGroup(input, [...fields, ...groupBy], valueField)
				console.log(data)
			}

			if (nestBy) {
				let fields = [...groupBy, nestBy, valueField, 'valueCount']
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

				data = data
					.map(({ key, value }) => ({
						key,
						value: [...value, ...missingRows(value)]
					}))
					.map((d) =>
						d.value.map((x) => {
							const key = JSON.stringify(pick(groupBy, x))
							const diff = combiCounts[key] - x[valueField].length
							x[valueField] = [...x[valueField], ...Array(diff).fill(dummy)]
							return x
						})
					)
			}
			return data
		}
	}

	return f
}

/**
 *
 * @param {Array} array
 * @param {Array} fields
 * @param {String} y
 * @returns a flat grouped object array
 */
export function flatObjectGroup(data, fields, y) {
	const attr = fields.map((x) => (d) => d[x])
	const keys = [...fields, y]
	let grouped = flatGroup(data, ...attr)
		.map((x) =>
			x.reduce((acc, item, index) => ({ ...acc, [keys[index]]: item }), {})
		)
		.map((d) => ({
			...d,
			[y]: d[y].map((v) => ({ y: v[y], isTweenHidden: false }))
		}))

	return grouped
}
// stages
// 1. Group by fields and roll up value
// 2. Identify combinations and max counts
// 3. Nest by
// 4. Fill missing groups
// 5. Fill missing values

// export function rollup(array, nestBy, groupBy, value) {
// 	const attr = fields.map((x) => (d) => d[x])
// 	const keys = [...fields, y]
// 	let grouped = flatGroup(data, ...attr)
// 		.map((x) =>
// 			x.reduce((acc, item, index) => ({ ...acc, [keys[index]]: item }), {})
// 		)
// 		.map((d) => ({
// 			...d,
// 			[y]: d[y].map((v) => ({ y: v[y], isTweenHidden: false }))
// 		}))

// 	return grouped
// }

// export function evaluate(input, groupBy) {
// 	const groups = pipe(map(pick(groupBy)), uniq)(input)
// 	const groupCounts = groups
// 		.map(JSON.stringify())
// 		.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})

// 	missingRows = pipe(
// 		map(pick(groupBy)),
// 		uniq,
// 		difference(combinations),
// 		map(mergeLeft({ [valueField]: [] }))
// 	)
// }

// export function bundle(array, nestBy) {
// 	data = nest()
// 		.key((d) => d[nestBy])
// 		.sortKeys(sortOrder)
// 		.rollup((values) => values.map(omit([nestBy])))
// 		.entries(data.map(pick(fields)))
// }

// export function fillMissingGroups(data, groupBy) {
// 	data.map((d) =>
// 		d.value.map((x) => {
// 			const key = JSON.stringify(pick(groupBy, x))
// 			combiCounts[key] = Math.max(combiCounts[key], x[valueField].length)
// 		})
// 	)
// 	data = data.map(({ key, value }) => ({
// 		key,
// 		value: addHiddenValues(value, missingRows, combiCounts, valueField, groupBy)
// 	}))
// }

export function fillMissingValues(
	values,
	missingRows,
	counts,
	valueField,
	groupBy
) {
	const dummy = { y: 0, isTweenHidden: true }
	const result = [...values, ...missingRows(values)].map((x) => {
		const key = JSON.stringify(pick(groupBy, x))
		const diff = counts[key] - x[valueField].length
		x[valueField] = [...x[valueField], ...Array(diff).fill(dummy)]
		return x
	})

	return result
}
