/**
 * Check if a value is a date string
 * @param {string} value
 * @returns {boolean}
 */
function isDateString(value) {
	return !isNaN(Date.parse(value))
}

function deriveTypeFromEmptyValue(value) {
	if (value === undefined || value === null) return 'string'
	return typeof value
}
/**
 * Infer the type of a value as array, date or the default type
 * @param {any} value
 * @returns {string}
 */
function deriveArrayAndDateTypes(value) {
	if (Array.isArray(value)) return 'array'
	if (value instanceof Date) return 'date'

	return deriveTypeFromEmptyValue(value)
}
/**
 * Derive the type of a value
 * @param {any} value
 * @returns {string}
 */
export function typeOf(value) {
	const type = deriveArrayAndDateTypes(value)
	if (type === 'string' && isDateString(value)) return 'date'
	if (type === 'number' && Number.isInteger(value)) return 'integer'

	return type
}
