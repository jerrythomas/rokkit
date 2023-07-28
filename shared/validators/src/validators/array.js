export const toIncludeAll = (received, expected) => {
	const pass = expected.every((v) => received.includes(v))
	const text = pass ? 'to not' : 'to'

	return {
		message: () =>
			`expected ${JSON.stringify(
				received
			)} ${text} include all of ${JSON.stringify(expected)}`,
		pass
	}
}
