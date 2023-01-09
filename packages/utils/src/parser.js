export function parseFilters(string) {
	const results = []

	// Create a regular expression to extract the named groups
	const regex =
		/((?<name>[\w|_]+)\s*(?<operator>:|>|<|>=|<=|=<|=>|=|!=|~|~\*|!~|!~\*)\s*)?(?<value>"[^"]+"|[\w\d]+)/gm

	// Split the string into an array of tokens
	const tokens = string.matchAll(regex)

	// Iterate over the tokens
	for (const token of tokens) {
		// Initialize an empty object for the current token
		const obj = {}

		// Extract the named groups from the token
		const { name, operator, value } = token.groups

		if (name) {
			obj.column = name
		}
		obj.operator = (operator ?? '~*')
			.replace(':', '~*')
			.replace('=>', '>=')
			.replace('=<', '<=')

		if (value) {
			const quoteMatch = value.match(/^"([^"]+)"$/)
			obj.value = quoteMatch
				? quoteMatch[1]
				: !isNaN(parseInt(value))
				? parseInt(value)
				: value

			if (obj.operator.includes('~')) {
				obj.value = obj.operator.includes('*')
					? new RegExp(obj.value, 'i')
					: new RegExp(obj.value)
			}
		}

		results.push(obj)
	}

	return results
}
