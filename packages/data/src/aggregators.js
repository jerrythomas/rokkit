/**
 * Counts the number of values in an array.
 *
 * @param {Array} values - An array of values to count.
 * @returns {number} The count of values in the array.
 */
export const counter = (values) => values.length

/**
 * Calculates the quartiles and interquartile range (IQR) of a numeric data array.
 * Assumes that the `quantile` function is defined elsewhere and can calculate a
 * quantile for a given array of numbers and a probability.
 *
 * @param {number[]} values - An array of numeric values to calculate the quartiles for.
 * @returns {Object} An object containing the first quartile (q1), third quartile (q3),
 *                   interquartile range (iqr), and the minimum and maximum range values (qr_min, qr_max)
 *                   after applying the IQR rule for identifying potential outliers.
 */
export const violin = (values) => {
	const { q1, q3 } = values
	const iqr = q3 - q1

	return { ...values, q1, q3, iqr, qr_min: q1 - 1.5 * iqr, qr_max: q1 + 1.5 * iqr }
}
