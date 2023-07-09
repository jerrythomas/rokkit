export function getRegex() {
	let column = '[\\w]+'
	let operator = ':|>|<|>=|<=|=<|=>|=|!=|~|~\\*|!~|!~\\*'
	let value = '("[^"]+"|[^\\s=:<>!~*]+)'

	let pattern = `(?<group>((?<column>${column})\\s?(?<operator>${operator})\\s?)(?<value>${value}))`

	return new RegExp(pattern, 'gm')
}

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
