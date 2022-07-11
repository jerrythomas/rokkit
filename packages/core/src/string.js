/**
 * Capitalize a string
 *
 * @param {String} text
 * @returns
 */
export function toCapitalCase(text) {
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
		.map((part) => toCapitalCase(part))
		.join('')
}

/**
 * Convert a PascalCase string to snake case with separator as hyphen
 *
 * @param {Strin} text
 * @returns
 */
export function toHyphenCase(text) {
	return text
		.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
		.replace(/^-/, '')
}

/**
 * Sort by splitting hyphen separated strings while keeping strings with same number of parts together
 *
 * @param {String} a hyphen separates string
 * @param {String} b hyphen separates string
 * @returns
 */
export function sortByParts(a, b) {
	const partsOfA = a.split('-')
	const partsOfB = b.split('-')

	let result = compareStrings(partsOfA[0], partsOfB[0])
	if (result == 0) result = partsOfA.length - partsOfB.length
	if (result == 0) result = compareStrings(a, b)
	return result
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
