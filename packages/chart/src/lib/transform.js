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
		rollup: (field) => {
			valueField = field
			return f
		},
		transform: (input) => {
			let data = input

			if ((groupBy.length || nestBy) && valueField) {
				const fields = nestBy ? [nestBy] : []
				data = flatObjectGroup(input, [...fields, ...groupBy], valueField)
			}

			if (nestBy && valueField) {
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
					value: spread(
						addHiddenValues(
							value,
							missingRows,
							combiCounts,
							valueField,
							groupBy
						),
						valueField
					)
				}))
			} else if (groupBy.length && valueField) {
				data = spread(data, valueField)
			}
			return data
		}
	}

	return f
}

function addHiddenValues(values, missingRows, counts, valueField, groupBy) {
	const dummy = { y: 0, tweenVisibility: 0 }
	const sorter = multiAttributeSorter(groupBy)
	const result = [...values, ...missingRows(values)]
		.sort(sorter)
		.map((item) => {
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

/**
 * Spreads an object into an array repeating all attributes for every item in the valueField array
 *
 * @param {Array} data
 * @param {String} valueField
 * @returns {Array} of objects
 */
function spread(data, valueField) {
	let result = []

	data.map((d) => {
		if (Array.isArray(d[valueField])) {
			let groups = omit([valueField], d)
			result = [
				...result,
				...d[valueField].map((v) => ({
					...groups,
					[valueField]: v.y,
					tweenVisibility: v.tweenVisibility
				}))
			]
		} else {
			result = [...result, d]
		}
	})
	return result
}

/**
 * https://stackoverflow.com/a/38037580
 *
 * @param {*} props
 * @returns
 */
function multiAttributeSorter(props) {
	return function (a, b) {
		for (var i = 0; i < props.length; i++) {
			var prop = props[i]
			var name = prop.name || prop
			var reverse = prop.reverse || false
			if (a[name] < b[name]) return reverse ? 1 : -1
			if (a[name] > b[name]) return reverse ? -1 : 1
		}
		return 0
	}
}
