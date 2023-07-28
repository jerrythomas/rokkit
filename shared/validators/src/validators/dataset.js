import { equals } from 'ramda'

export const toHaveValidData = (received, expected) => {
	const actual = { ...received.dataset }
	const pass = equals(actual, expected)
	const text = pass ? 'to not' : 'to'

	return {
		message: () =>
			`expected ${JSON.stringify(actual)} ${text} match ${JSON.stringify(
				expected
			)}`,
		pass
	}
}
