import { ascending, descending } from 'd3-array'
import { counter } from './aggregators'

/**
 * @typedef {Object} ColumnSorter
 * @property {string} column
 * @property {function} sorter
 */

function isDateString(value) {
	return !isNaN(Date.parse(value))
}

function getType(value) {
	let type = Array.isArray(value) ? 'array' : typeof value
	return type === 'string' && isDateString(value) ? 'date' : type
}

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
			type: data.map((d) => d[field]).some(isNaN) ? 'string' : 'number'
		}))
		.reduce(
			(acc, cur) => ({ ...acc, [cur.type]: [...acc[cur.type], cur.field] }),
			{ string: [], number: [] }
		)
	return dataTypes
}

export function inferDataType(values) {
	if (values.length === 0) {
		return 'undefined'
	}

	const nonNullValues = values.filter((value) => value !== null)

	if (nonNullValues.length === 0) {
		return 'null'
	}

	let type = getType(nonNullValues[0])

	for (let i = 1; i < nonNullValues.length; i++) {
		if (getType(nonNullValues[i]) !== type) {
			type = 'mixed'
			break
		}
	}

	return type
}
