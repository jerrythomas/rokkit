import { getMessage } from './internal'

/**
 * Verify that an array contains all of the expected values
 *
 * @param {Array} received - the array to inspect
 * @param {Array} expected - the values to check for
 */
export function toIncludeAll(received, expected) {
	const pass = expected.every((v) => received.includes(v))

	return {
		message: () => getMessage(received, expected, pass, 'include all of'),
		pass
	}
}
