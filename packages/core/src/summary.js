import { quantile } from 'd3-array'
import { omit, pick } from 'ramda'
import { deriveAggregators } from './infer'

export const counter = (values) => values.length

export const quantiles = (values) => {
	const q1 = quantile(values, 0.25)
	const q3 = quantile(values, 0.75)
	const iqr = q3 - q1

	return { q1, q3, iqr, qr_min: q1 - 1.5 * iqr, qr_max: q1 + 1.5 * iqr }
}

export function groupBy(...cols) {
	let opts = {
		by: cols,
		exclude: [],
		include: undefined,
		agg: []
	}

	const exclude = (...cols) => {
		opts.exclude = cols
		return { aggregate, from }
	}
	const include = (...cols) => {
		opts.include = cols
		return { aggregate, from }
	}

	const aggregate = (...cols) => {
		opts.agg = cols
		return { from }
	}

	const from = (data) => {
		const select = opts.include ? pick(opts.include) : omit(opts.exclude)

		let grouped = data.reduce((acc, cur) => {
			const group = pick(opts.by, cur)
			const value = select(cur)
			const key = JSON.stringify(group)

			if (key in acc) acc[key]._df = [...acc[key]._df, value]
			else acc[key] = { ...group, _df: [value] }
			return acc
		}, {})
		grouped = Object.values(grouped)
		if (opts.agg.length > 0) {
			return grouped.map((row) => ({
				...omit(['_df'], row),
				...summarize(row._df, ...opts.agg)
			}))
		}
		return grouped
	}

	return { exclude, include, aggregate, from }
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
