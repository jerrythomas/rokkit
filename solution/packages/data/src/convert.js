import { inferDataType } from './infer'

/**
 * Converts an array of objects into a columnar structure, returning an object with two attributes:
 *
 * - columns, which contains an array of column names
 * - data, which is an object with column names as keys and arrays as values.
 *
 * @param {Array<Object>} input
 * @returns {import('./types').Dataframe}
 */
export function fromArray(input) {
	const data = {}
	let columns = []

	input.forEach((items, index) => {
		const keys = Object.keys(items)
		const missing = columns.filter((x) => !keys.includes(x))

		columns = [...columns, ...keys.filter((x) => !columns.includes(x))]

		missing.forEach((key) => {
			data[key] = [...data[key], null]
		})
		keys.forEach((key) => {
			if (key in data) {
				data[key] = [...data[key], items[key]]
			} else {
				data[key] = [...Array(index).fill(null), items[key]]
			}
		})
	})

	const types = columns.reduce((acc, x) => ({ ...acc, [x]: inferDataType(data[x]) }), {})
	return { data, columns, types }
}
