import { filterOperations } from './constants'

/**
 * Filters an array of objects based on a specified condition defined in the options.
 * If a column is provided, it filters based on the value of that column. Otherwise, it filters
 * based on a value present in any of the object's properties.
 *
 * @param {Object[]} data - The array of objects to filter.
 * @param {Object} options - The filtering options that define the condition.
 * @param {string} [options.column] - The property name in the objects to filter by. If omitted, all properties are considered.
 * @param {string|number} [options.value] - The value to compare against when filtering.
 * @param {string} [options.operator] - The operator to use for comparison, should match a key in the filterOperations object.
 * @returns {Object[]} - The filtered array of objects.
 */
export function filterObjectArray(data, options) {
	const { column, value, operator } = options
	// If no operator or value is given, return the data unchanged.
	if (!operator || !value) return data
	// If a column is specified, perform the filtering on that specific column.
	if (column) return data.filter((row) => filterOperations[operator](row[column], value))

	return data.filter((row) => findMatchingRow(row, value, operator))
}

/**
 * Checks if a row matches the given value based on the specified operator.
 * Supports both standard and negated operators by checking the operator string
 * for a leading '!' character, which indicates negation.
 *
 * @param {Object} row - The row object in which to search for the value match.
 * @param {any} value - The value to match against the row's properties.
 * @param {string} operator - The operator used to compare the row's properties to the value.
 *                            When operator starts with '!', it negates the result of the comparison.
 * @returns {boolean} - Returns true if the row matches the condition; otherwise, returns false.
 */
function findMatchingRow(row, value, operator) {
	const op = operator.startsWith('!') ? operator.slice(1) : operator
	const matched = Object.keys(row).some((key) => filterOperations[op](row[key], value))

	return operator.startsWith('!') ? !matched : matched
}

/**
 * Applies multiple filtering conditions to an array of objects. This function iterates through each filter option,
 * successively narrowing down the data.
 *
 * @param {Object[]} data - The array of objects to filter.
 * @param {Object[]} filters - An array of filtering options to apply to the data.
 * @returns {Object[]} - The filtered array of objects that meet all conditions specified by the filters.
 */
export function filterData(data, filters) {
	let filteredData = data
	filters.forEach((filter) => {
		filteredData = filterObjectArray(filteredData, filter)
	})
	return filteredData
}
