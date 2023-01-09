/**
 * Options for joining two data sets
 *
 * @typedef OptionsToRenameKeys
 * @property {string} [prefix]         - Prefix to be added to each attribute
 * @property {string} [suffix]         - Suffix to be added to each attribute
 * @property {string} [separator]      - Separator to be used when adding prefix or suffix. defaults to _
 */

/**
 * Returns a function that renames keys of an object by adding a prefix or suffix to each key
 *
 * @param {OptionsToRenameKeys} opts
 * @returns
 */
export function renameUsing(opts = {}) {
	const { prefix, suffix, separator } = { separator: '_', ...opts }
	let rename = (x) => x
	if (prefix) {
		rename = (x) => [prefix, x].join(separator)
	} else if (suffix) {
		rename = (x) => [x, suffix].join(separator)
	}

	return (row) =>
		Object.entries(row).reduce(
			(acc, [key, value]) => ({ ...acc, [rename(key)]: value }),
			{}
		)
}
function leftJoin(a, b, query, opts = {}) {
	const { inner } = { inner: true, ...opts }
	const rename = renameUsing(opts)
	return a
		.map((x) => {
			const matched = b
				.filter((y) => query(x, y))
				.map((y) => ({ ...rename(y), ...x }))
			return matched.length ? matched : inner ? [] : [x]
		})
		.reduce((acc, cur) => [...acc, ...cur], [])
}
export function innerJoin(a, b, query, opts = {}) {
	return leftJoin(a, b, query, opts)
}
export function outerJoin(a, b, query, opts = {}) {
	return leftJoin(a, b, query, { inner: false, ...opts })
}
export function fullJoin(a, b, query, opts) {
	const rename = renameUsing(opts)
	const res1 = outerJoin(a, b, query, opts)
	const res2 = b
		.map((y) => {
			const res = a.filter((x) => query(x, y))
			return res.length === 0 ? [{ ...rename(y) }] : []
		})
		.reduce((acc, cur) => [...acc, ...cur], [])
	return [...res1, ...res2]
}

export function join(a, b, query, opts = {}) {
	const { type } = { type: 'inner', ...opts }
	switch (type) {
		case 'inner':
			return innerJoin(a, b, query, opts)
		case 'outer':
			return outerJoin(a, b, query, opts)
		case 'full':
			return fullJoin(a, b, query, opts)
		default:
			throw new Error(`Unknown join type: ${type}`)
	}
}
