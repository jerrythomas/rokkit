import { equals } from 'ramda'
import { getMessage } from './internal'

export const toHaveValidData = (received, expected) => {
	const actual = { ...received.dataset }
	const pass = equals(actual, expected)

	return {
		message: () => getMessage(actual, expected, pass),
		pass
	}
}
