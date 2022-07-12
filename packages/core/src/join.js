import { pick, omit, curry } from 'ramda'

/**
 * @func
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 */
export const suffixer = curry((suffix, row) => {
	return Object.entries(row).reduce(
		(acc, [key, value]) => ({ ...acc, [key + suffix]: value }),
		{}
	)
})

export const prefixer = curry((prefix, row) => {
	return Object.entries(row).reduce(
		(acc, [key, value]) => ({ ...acc, [prefix + key]: value }),
		{}
	)
})

export const renamer = (opts) => {
	return opts.prefix
		? prefixer(opts.prefix)
		: opts.suffix
		? suffixer(opts.suffix)
		: passThrough
}

export const selector = (opts) => {
	return opts.include
		? pick(opts.include)
		: opts.exclude
		? omit(opts.exclude)
		: passThrough
}

export const passThrough = (x) => x

/**
 * Options for joining two data sets
 *
 * @typedef JoinOptions
 * @property {Array<string>} [include] - Array of attributes to include
 * @property {Array<string>} [exclude] - Array of attributes to exclude
 * @property {string} [prefix]         - Prefix to be added to each attribute
 * @property {string} [suffix]         - Suffix to be added to each attribute
 */

/**
 * Provides different options to combine two datasets A & B.
 *
 * - attributes from A override attributes from B if an attribute exists in both
 * - optionally rename columns of both A & B to prevent clashes
 * - optionally include or exclude columns from both A & B
 *
 * @param {Array<Object>} a
 * @param {Array<Object>} b
 * @returns
 */
export const join = (a, b) => {
	let attrA, attrB

	/**
	 * Options to determine the attributes names and whethere they are included in teh final result.
	 *
	 * @param {JoinOptions} optsA
	 * @param {JoinOptions} optsB
	 * @returns
	 */
	const options = (optsA = {}, optsB = {}) => {
		const renameA = renamer(optsA)
		const renameB = renamer(optsB)
		const selectA = selector(optsA)
		const selectB = selector(optsB)

		attrA = (x) => renameA(selectA(x))
		attrB = (x) => renameB(selectB(x))
		return { inner, outer, full }
	}

	/**
	 * Combines two data sets A & B and returns a data set comprising of
	 * elements from both A & B including only rows where a match is found
	 * between A & B using the predicate function.
	 *
	 * - Only rows where a match is found between A & B are included
	 * - Result may have more rows if multiple rows in B match a row in A
	 *
	 * @param {function} query a function that takes two arguments and returns true when a match is found
	 * @returns {Array<Object>} the joined data set
	 */
	const inner = (query) => {
		const res = a
			.map((x) => {
				const xattr = attrA(x)
				const matched = b
					.filter((y) => query(x, y))
					.map((y) => ({ ...attrB(y), ...xattr }))
				return matched
			})
			.reduce((acc, cur) => [...acc, ...cur], [])

		return res
	}

	/**
	 * Combines two data sets A & B and returns a data set comprising of
	 * all rows from A. & B including only rows where a match is found
	 * between A & B using the predicate function.
	 *
	 * - All rows from A are included
	 * - Attributes from B are included when a match is found
	 * - Rows without matches in B only have attributes from A
	 * - Result may have more rows if multiple rows in B match a row in A
	 *
	 * @param {function} query a function that takes two arguments and returns true when a match is found
	 * @returns {Array<Object>} the joined data set
	 */
	const outer = (query) => {
		const res = a
			.map((x) => {
				const xattr = attrA(x)
				const matched = b
					.filter((y) => query(x, y))
					.map((y) => ({ ...attrB(y), ...xattr }))
				return matched.length ? matched : [xattr]
			})
			.reduce((acc, cur) => [...acc, ...cur], [])

		return res
	}

	/**
	 * Combines two data sets A & B and returns a data set comprising of
	 * all rows from A & B.
	 *
	 * - All rows from A are included
	 * - All rows from B are included
	 * - Rows from A without match in B only have attributes from A
	 * - Rows from B without match in A only have attributes from B
	 * - Result may have more rows if multiple rows in B match a row in A
	 *
	 * @param {function} query a function that takes two arguments and returns true when a match is found
	 * @returns {Array<Object>} the joined data set
	 */
	const full = (query) => {
		const res1 = outer(query)
		const res2 = b
			.map((y) => {
				const res = a.filter((x) => query(x, y))
				return res.length === 0 ? [{ ...attrB(y) }] : []
			})
			.reduce((acc, cur) => [...acc, ...cur], [])
		return [...res1, ...res2]
	}

	options({}, {})
	return { options, inner, outer, full }
}

export function innerJoin(a, b, query) {
	return join(a, b).inner(query)
}
export function outerJoin(a, b, query) {
	return join(a, b).outer(query)
}
export function fullJoin(a, b, query) {
	return join(a, b).full(query)
}
