import { omit, identity } from 'ramda'

/**
 *
 *
 * @typedef {Object} OptionsToRenameKeys
 * @property {string} [prefix]        - The prefix to add to the key.
 * @property {string} [suffix]        - The suffix to add to the key.
 * @property {string} [separator='_'] - The separator to use between the key and the prefix or suffix.
 * @property {Array}  [keys]          - The keys to rename.
 */

/**
 * A generator function that produces a function to rename keys.
 *
 * @param {OptionsToRenameKeys} options - Options to rename keys
 * @returns {Object}                    - A renamer object.
 *
 * Example:
 *
 * renamer({ prefix: 'a', keys: ['a', 'b'] }).get()
 * renamer({ prefix: 'a', separator: '-' }).get()
 * renamer().setPrefix('a')
 *          .setSeparator('-')
 *          .setKeys(['a', 'b'])
 *          .get()
 * renamer().setPrefix('a').get()
 * renamer().setSuffix('b').get()
 * renamer().setKeys(['a', 'b']).get()
 */
export function renamer(options = {}) {
	const { prefix, suffix, separator = '_', keys = [] } = options
	const rename = getRenamer(prefix, suffix, separator)
	const renameObject = getObjectRenamer(rename, keys)

	return {
		get: () => ({ rename, renameObject }),
		setPrefix: (value) => renamer({ ...omit(['suffix'], options), prefix: value }),
		setSuffix: (value) => renamer({ ...omit(['prefix'], options), suffix: value }),
		setKeys: (value) => renamer({ ...options, keys: value }),
		setSeparator: (value) => renamer({ ...options, separator: value })
	}
}

/**
 * Generates a renamer function which adds a prefix or suffix to a string.
 *
 * @param {string} prefix    - The prefix to add to the key.
 * @param {string} suffix    - The suffix to add to the key.
 * @param {string} separator - The separator to use between the key and the prefix or suffix.
 * @returns {Function} - A function that takes a string and adds a prefix or suffix.
 */
function getRenamer(prefix, suffix, separator) {
	let rename = identity

	if (prefix) {
		rename = (x) => [prefix, x].join(separator)
	} else if (suffix) {
		rename = (x) => [x, suffix].join(separator)
	}
	return rename
}

/**
 * Returns a function that renames the keys of an object.
 *
 * @param {Function} rename - The function to rename the keys.
 * @param {Array}    keys   - The keys to rename.
 * @returns {Function}      - A function that takes an object and renames the keys.
 */
function getObjectRenamer(rename, keys) {
	if (rename === identity) return identity
	if (keys.length > 0) {
		const lookup = keys.reduce((acc, key) => ({ ...acc, [key]: rename(key) }), {})
		return usingLookup(lookup)
	}
	return forObject(rename)
}

/**
 * Renames the keys of an object using a lookup table.
 *
 * @param {Object} lookup - The lookup table.
 * @returns {Function} - A function that takes an object and renames the keys using the lookup table.
 */
function usingLookup(lookup) {
	return (row) => Object.keys(row).reduce((acc, key) => ({ ...acc, [lookup[key]]: row[key] }), {})
}

/**
 * Renames the keys of an object using a function.
 *
 * @param {Function} rename - The function to rename the keys.
 * @returns {Function} - A function that takes an object and renames the keys using the function.
 */
function forObject(rename) {
	return (row) => Object.keys(row).reduce((acc, key) => ({ ...acc, [rename(key)]: row[key] }), {})
}
