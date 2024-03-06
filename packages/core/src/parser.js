/**
 * Constructs a regular expression pattern for matching search filter strings.
 * The pattern captures "column", "operator", and "value" groups for filter expressions.
 * Supported operators include common comparison and wildcard operators.
 *
 * Examples of valid expressions this regex can match:
 * - "username:john_doe"
 * - "age>30"
 * - "status!=active"
 * - "title~\"Product Manager\""
 * - "completed!~*yes"
 *
 * The "column" group matches one or more word characters.
 * The "operator" group matches one among the specified comparison or wildcard operators:
 * :, >, <, >=, <=, =<, =>, =, !=, ~, ~*, !~, !~*.
 * The "value" group matches either a double-quoted string or a single unquoted word
 * that doesn't include whitespace or any of the operator characters.
 *
 * @returns {RegExp} - The regular expression pattern to identify search filter elements.
 */
export function getRegex() {
	let column = '[\\w]+'
	let operator = ':|>|<|>=|<=|=<|=>|=|!=|~|~\\*|!~|!~\\*'
	let value = '("[^"]+"|[^\\s=:<>!~*]+)'

	let pattern = `(?<group>((?<column>${column})\\s?(?<operator>${operator})\\s?)(?<value>${value}))`

	return new RegExp(pattern, 'gm')
}

/**
 * Parses a search string and extracts filters based on a predefined regular expression pattern.
 * Each filter captures column, operator, and value components. Any remaining text that
 * does not fit the pattern is considered a general search term.
 *
 * @param {string} string - The search string to parse for filters.
 * @returns {Object[]} - An array of filter objects each containing the column, operator, and value,
 *                       plus an additional object for general search if there is remaining text.
 */
export function parseFilters(string) {
	const results = []
	const regex = getRegex()

	// Split the string into an array of tokens
	const tokens = string.matchAll(regex)
	let search = string

	// Iterate over the tokens
	for (const token of tokens) {
		// Extract the named groups from the token
		let { group, column, operator, value } = token.groups
		search = search.replace(group, '').trim()

		operator = replaceOperators(operator)
		value = processValue(value, operator)

		if (column && value) results.push({ column, operator, value })
	}

	if (search.length > 0) {
		results.push({
			operator: '~*',
			value: new RegExp(removeQuotes(search), 'i')
		})
	}

	return results
}

/**
 * Replaces various shorthand operators with their standardized equivalent for filtering.
 *
 * @param {string} operator - The operator to be replaced.
 * @returns {string} - The replaced operator string.
 */
function replaceOperators(operator) {
	return operator.replace(':', '~*').replace('=>', '>=').replace('=<', '<=')
}

/**
 * Processes the filter value provided, converting it into a format suitable for filtering.
 * If the operator includes a tilde (~), the value is converted to a RegExp.
 *
 * @param {string|number} value - The value to be processed. It could be a string needing quote removal or a number that needs parsing.
 * @param {string} operator - The operator that determines the type of processing to be applied to the value.
 * @returns {string|number|RegExp} - The processed value, which may be a RegExp if the operator involves pattern matching.
 */
function processValue(value, operator) {
	// If the value can be parsed as an integer, do so. Otherwise, strip quotes if present.

	value = !isNaN(parseInt(value)) ? parseInt(value) : removeQuotes(value)
	// If the operator includes a tilde (~), treat the value as a regular expression,
	// case-insensitive if '*' is present, sensitive otherwise.
	if (operator.includes('~')) {
		value = operator.includes('*') ? new RegExp(value, 'i') : new RegExp(value)
	}

	return value
}

/**
 * Removes double quotes from the start and end of a string.
 *
 * @param {string} str - The input string from which the surrounding quotes should be removed.
 * @returns {string} - The unquoted string.
 */
function removeQuotes(str) {
	const quoteMatch = str.match(/^"([^"]+)"$/)
	return quoteMatch ? quoteMatch[1] : str
}
