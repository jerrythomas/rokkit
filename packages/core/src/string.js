import { filter } from 'ramda'
/**
 * Capitalizes the first letter of input string
 *
 * @param {String} str
 * @returns {String}
 */
export function toInitCapCase(text) {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert a hyphen separated string to PascalCase
 *
 * @param {String} text
 * @returns
 */
export function toPascalCase(text) {
	return text
		.split('-')
		.map((part) => toInitCapCase(part))
		.join('')
}

/**
 * Convert a PascalCase string to snake case with separator as hyphen
 *
 * @param {string} text
 * @returns {string}
 */
export function toHyphenCase(text) {
	return text
		.replace(/\s+/, '-')
		.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
		.replace(/^-/, '')
}

/**
 * Simple comparison for two strings
 *
 * @param {String} a
 * @param {String} b
 * @returns
 */
export function compareStrings(a, b) {
	return a > b ? 1 : a < b ? -1 : 0
}

/**
 * Sort by splitting hyphen separated strings while keeping strings with same number of parts together
 *
 * @param {String} a hyphen separates string
 * @param {String} b hyphen separates string
 * @param {string} separator - separator to split the string
 * @returns {Number} -1, 0, 1 based on comparison
 */
export function sortByParts(a, b, separator = '-') {
	const partsOfA = a.split(separator)
	const partsOfB = b.split(separator)

	let result = compareStrings(partsOfA[0], partsOfB[0])
	if (result === 0) result = partsOfA.length - partsOfB.length
	if (result === 0) result = compareStrings(a, b)
	return result
}

/**
 * Generates a unique id from current timestamp
 *
 * @returns {String} timestamp based unique id
 */
export function uniqueId(prefix = '', separator = '-') {
	const pair = prefix && prefix.length > 0 ? [prefix] : []
	pair.push(Date.now().toString(36))
	return pair.join(separator)
}

/**
 * Removes undefined and null values from the input object.
 *
 * @param {Object} obj
 * @returns {Object}
 */
export function compact(obj) {
	return filter((x) => x !== undefined && x !== null, obj)
}

/**
 * Converts an input number into it's hexadecimal representation, with optional left padded zeroes based on the `size`
 *
 * @param {number} value
 * @param {number} size
 * @returns
 */
export function toHexString(value, size = 2) {
	return value.toString(16).padStart(size, '0')
}
