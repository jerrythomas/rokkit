import { identity } from 'ramda'

/**
 * Creates a formatter function that formats a value according to the specified type and optional locale settings.
 * Supported types include 'default' (no formatting), 'integer', 'number', 'date', 'time', and 'currency'.
 *
 * The function is curried, which means it can be partially applied with some arguments and reused
 * to format different values with the same settings.
 *
 * @param {string} type - The type of the formatter to use (e.g., 'integer', 'number', 'date', 'time', 'currency').
 * @param {string} [language='en-US'] - Optional IETF language tag used for locale-specific formatting.
 * @param {string} [currency='USD'] - Optional currency code which is relevant when the type is 'currency'.
 * @param {number} [decimalPlaces=2] - Optional number of decimal places to show with number and currency formatting.
 * @param {number|Date} value - The value to format, it should be of a type corresponding to the formatter type.
 * @returns {*} - The formatted value as a string or the original value if formatting is not applicable.
 */
export function createFormatter(type, language = 'en-US', decimalPlaces = 2, currency) {
	const formatWithLocaleOptions = (options, val) => val.toLocaleString(language, options)
	const formatCurrency = (val, currency = 'USD') =>
		val.toLocaleString(language, {
			style: 'currency',
			currency,
			minimumFractionDigits: decimalPlaces,
			maximumFractionDigits: decimalPlaces
		})

	const formatters = {
		integer: (val) => formatWithLocaleOptions({ maximumFractionDigits: 0 }, val), // Integer without decimals
		number: (val) =>
			formatWithLocaleOptions(
				{
					minimumFractionDigits: decimalPlaces,
					maximumFractionDigits: decimalPlaces
				},
				val
			), // Number with fixed decimal places
		date: (val) => val.toLocaleDateString(language), // Locale-specific date format
		time: (val) => val.toLocaleTimeString(language), // Locale-specific time format
		currency: currency ? (val) => formatCurrency(val, currency) : formatCurrency
		// Currency with fixed decimal places and currency symbol
	}
	if (type in formatters) return formatters[type]
	return identity
	// return propOr(identity, type, formatters)(value) // Apply the formatter based on the type
}

// export
