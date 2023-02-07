export function parseFilters(string) {
	const results = []
	const regex =
		/(?<group>((?<column>[\w_]+)\s?(?<operator>:|>|<|>=|<=|=<|=>|=|!=|~|~\*|!~|!~\*)\s?)(?<value>"[^"]+"|[^\s=:<>!~*]+))/gm

	// Split the string into an array of tokens
	const tokens = string.matchAll(regex)
	let search = string
	// Iterate over the tokens
	for (const token of tokens) {
		// Extract the named groups from the token
		let { group, column, operator, value } = token.groups
		search = search.replace(group, '').trim()

		operator = operator
			.replace(':', '~*')
			.replace('=>', '>=')
			.replace('=<', '<=')

		if (value) {
			value = !isNaN(parseInt(value)) ? parseInt(value) : removeQuotes(value)

			if (operator.includes('~')) {
				value = operator.includes('*')
					? new RegExp(value, 'i')
					: new RegExp(value)
			}
		}
		if (column && value) results.push({ column, operator, value })
	}
	if (search.length > 0) {
		// const quoteMatch = search.match(/^"([^"]+)"$/)
		// search = quoteMatch ? quoteMatch[1] : search
		results.push({
			operator: '~*',
			value: new RegExp(removeQuotes(search), 'i')
		})
	}

	return results
}

function removeQuotes(str) {
	const quoteMatch = str.match(/^"([^"]+)"$/)
	return quoteMatch ? quoteMatch[1] : str
}