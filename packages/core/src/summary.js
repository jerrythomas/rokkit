import { quantile } from 'd3-array'
import { omit, pick } from 'ramda'

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
		include: undefined
	}

	const exclude = (...cols) => {
		opts.exclude = cols
		return { from }
	}
	const include = (...cols) => {
		opts.include = cols
		return { from }
	}

	const from = (data) => {
		const select = opts.include ? pick(opts.include) : omit(opts.exclude)

		const grouped = data.reduce((acc, cur) => {
			const group = pick(opts.by, cur)
			const value = select(cur)
			const key = JSON.stringify(group)

			if (key in acc) acc[key]._df = [...acc[key]._df, value]
			else acc[key] = { ...group, _df: [value] }
			return acc
		}, {})
		return Object.values(grouped)
	}

	return { exclude, include, from }
}

export function addSuffix(row, suffix) {
	return Object.entries(row).reduce(
		(acc, [key, value]) => ({ ...acc, [key + suffix]: value }),
		{}
	)
}

/**
 * @typedef JoinOptions
 * @property {object} a
 * @property {object} b
 * @property {function} query the query used to match rows
 */
/**
 * Joins data from to object arrays using a matching query
 *
 *   - first table's attributes override second table's attributes with same names
 *   - Use suffix option for a or b to add a suffix
 *   - include option allows you to select attributes in result
 *   - exclude option allows you to remove unwanted columns from result
 *   - include takes precendence over exclude when both are provided
 *
 * @param {Array<object>} a
 * @param {Array<object>} b
 * @param {JoinOptions} opts
 * @returns
 */
export function innerJoin(a, b, opts) {
	opts = { a: {}, b: {}, ...opts }

	const selectA = opts.a.include
		? pick(opts.a.include)
		: omit(opts.a.exclude || [])
	const renameA = opts.a.suffix ? (x) => addSuffix(x, opts.a.suffix) : (x) => x
	const selectB = opts.b.include
		? pick(opts.b.include)
		: omit(opts.b.exclude || [])
	const renameB = opts.b.suffix ? (x) => addSuffix(x, opts.b.suffix) : (x) => x

	const res = a
		.map((x) => {
			const xattr = renameA(selectA(x))
			const matched = b
				.filter((y) => opts.query(x, y))
				.map((y) => ({ ...renameB(selectB(y)), ...xattr }))
			return matched
		})
		.reduce((acc, cur) => [...acc, ...cur], [])

	return res
}
