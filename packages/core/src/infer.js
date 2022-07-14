import { ascending, descending } from 'd3-array'
import { counter } from './summary'

/**
 * @typedef {Object} ColumnSorter
 * @property {string} column
 * @property {function} sorter
 */

/**
 *
 * @param  {...[string|[string, boolean]]} cols
 * @returns {Array<ColumnSorter>}
 */
export function deriveSortableColumns(...cols) {
	return cols.map((value) => {
		if (Array.isArray(value)) {
			return { column: value[0], sorter: value[1] ? ascending : descending }
		}
		return { column: value, sorter: ascending }
	})
}

export function deriveAggregators(...cols) {
	return cols.map((name) => {
		if (Array.isArray(name)) {
			return { column: name[0], aggregator: name[1], suffix: name[2] || '' }
		}
		return {
			column: name,
			aggregator: counter,
			suffix: 'count'
		}
	})
}

export function deriveColumns(data) {
	if (data.length === 0) return []
	return Array.from(
		data.map((row) => Object.keys(row)).reduce((p, n) => new Set([...p, ...n]))
	)
}

export function deriveDataTypes(data) {
	let dataTypes = Object.keys(data[0])
		.map((field) => ({
			field,
			type: data.map((d) => d[field]).some(isNaN) ? 'string' : 'numeric'
		}))
		.reduce(
			(acc, cur) => ({ ...acc, [cur.type]: [...acc[cur.type], cur.field] }),
			{ string: [], numeric: [] }
		)
	return dataTypes
}
