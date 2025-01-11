import { equals } from 'ramda'
import { getMessage } from './internal'

/**
 * Check if the element has valid data attributes
 *
 * @param {HTMLElement} received - HTML element to be checked
 * @param {Object}      expected - data to be compared
 */
export function toHaveValidData(received, expected) {
	const actual = { ...received.dataset }
	const pass = equals(actual, expected)

	return {
		message: () => getMessage(actual, expected, pass),
		pass
	}
}
