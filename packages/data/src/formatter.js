import { identity } from 'ramda'

const formatterMap = {
	currency: getCurrencyFormatter,
	integer: (language) => (val) => val.toLocaleString(language, { maximumFractionDigits: 0 }),
	number: (language, decimalPlaces) => (val) =>
		val.toLocaleString(language, {
			minimumFractionDigits: decimalPlaces,
			maximumFractionDigits: decimalPlaces
		}),
	date: (language) => (val) => val.toLocaleDateString(language),
	time: (language) => (val) => val.toLocaleTimeString(language),
	object: () => JSON.stringify,
	array: () => JSON.stringify, // Combined formatter for 'object' and 'array'
	ellipsis: () => () => '...' // Static formatter, no need for parameters
}

/**
 * Returns a currency formatter function that formats a value as a currency string.
 * @param {string} language       - The IETF language tag used for locale-specific formatting.
 * @param {number} decimalPlaces  - The number of decimal places to show with currency formatting.
 * @returns {function}            - A currency formatter function that takes a value and returns a formatted string.
 */
function getCurrencyFormatter(language, decimalPlaces) {
	/**
	 * Formats a value as a currency string with the desired decimal places.
	 *
	 * @param {number} val              - The value to format as a currency string.
	 * @param {string} [currency='USD'] - The currency code to use for formatting.
	 * @returns {string}                - The formatted currency string.
	 */
	const formatter = (val, currency = 'USD') =>
		val.toLocaleString(language, {
			style: 'currency',
			currency,
			minimumFractionDigits: decimalPlaces,
			maximumFractionDigits: decimalPlaces
		})
	return formatter
}

/**
 * Creates a formatter function that formats a value according to the specified type and optional locale settings.
 * Supported types include 'default' (no formatting), 'integer', 'number', 'date', 'time',, 'object', 'array', 'currency' & 'ellipsis''
 *
 * @param {string} type               - The type of the formatter to use (e.g., 'integer', 'number', 'date', 'time', 'currency').
 * @param {string} [language='en-US'] - Optional IETF language tag used for locale-specific formatting.
 * @param {number} [decimalPlaces=2]  - Optional number of decimal places to show with number and currency formatting.
 * @returns {*}                       - A format function that takes a value and returns a formatted string.
 */
export function createFormatter(type, language = 'en-US', decimalPlaces = 2) {
	const formatter = formatterMap[type]
	if (formatter) return formatter(language, decimalPlaces)

	return identity
}
