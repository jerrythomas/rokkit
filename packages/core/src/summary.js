import { quantile } from 'd3-array'
import {
	omit,
	pick,
	mergeLeft,
	mergeRight,
	zipObj,
	map,
	difference,
	uniq,
	pipe
} from 'ramda'
import { deriveAggregators, deriveDataTypes } from './infer'

export const counter = (values) => values.length

export const quantiles = (values) => {
	const q1 = quantile(values, 0.25)
	const q3 = quantile(values, 0.75)
	const iqr = q3 - q1

	return { q1, q3, iqr, qr_min: q1 - 1.5 * iqr, qr_max: q1 + 1.5 * iqr }
}

export function groupBy(data, by, opts = {}) {
	const select = opts.include ? pick(opts.include) : omit(opts.exclude || [])
	const grouped = data.reduce((acc, cur) => {
		const group = pick(by, cur)
		const value = select(cur)
		const key = JSON.stringify(group)

		let _df = Object.keys(value).length > 0 ? [value] : []

		if (key in acc) {
			acc[key]._df = [...acc[key]._df, ..._df]
		} else {
			acc[key] = { ...group, _df }
		}
		return acc
	}, {})
	return Object.values(grouped)
}

export function summarize(data, ...cols) {
	const rename = (name, suffix) => {
		return suffix ? [name, suffix].join('_') : name
	}

	const opts = deriveAggregators(...cols)
	const result = opts
		.map((col) => {
			const values = data.map((row) => +row[col.column])
			let result = col.aggregator(values)

			if (typeof result === 'object') {
				result = Object.keys(result).reduce(
					(acc, suffix) => ({
						...acc,
						[rename(col.column, suffix)]: result[suffix]
					}),
					{}
				)
			} else {
				const name = rename(col.column, col.suffix)
				result = { [name]: result }
			}
			return result
		})
		.reduce((acc, curr) => ({ ...acc, ...curr }), {})
	return result
}

export function getGeneratorForMissingRows(data, cols, opts = {}) {
	// let subset = data.map((d) => d._df).reduce((acc, d) => [...acc, ...d], [])
	// let fieldsOfType = deriveDataTypes(subset)
	let columns = opts.cols || Object.keys(data[0])

	let remaining = columns
		.filter((x) => !cols.includes(x))
		.reduce((acc, x) => ({ ...acc, [x]: null }), {})

	const imputedValues = { ...remaining, ...(opts.defaults || {}) }
	//mergeRight(
	// zipObj(fieldsOfType.numeric, Array(fieldsOfType.numeric.length).fill(0)),
	//pick(fieldsOfType.string, opts.defaults)
	//)

	const groups = pipe(map(pick(cols)), uniq)(data)

	const generator = pipe(
		map(pick(cols)),
		uniq,
		difference(groups),
		map(mergeLeft(imputedValues))
	)

	return generator
}

export function fillMissingGroups(data, cols, opts) {
	if (!Array.isArray(cols))
		throw new TypeError('cols must be an array of column names')

	if (cols.length == 0) throw new Error('cols must contain at least one column')

	let subset = data.map((d) => d._df).reduce((acc, x) => acc.concat(x), [])

	const generateRows = getGeneratorForMissingRows(subset, cols, opts)

	return data.map((d) => ({
		...d,
		_df: [...d._df, ...generateRows(d._df)]
	}))
}
