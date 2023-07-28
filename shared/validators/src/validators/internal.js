export function getMessage(actual, expected, pass, condition = 'deeply equal') {
	return [
		'expected',
		JSON.stringify(actual),
		pass ? 'to not' : 'to',
		condition,
		JSON.stringify(expected)
	].join(' ')
}
