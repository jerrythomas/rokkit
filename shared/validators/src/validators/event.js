import { equals } from '@vitest/expect'
import { getMessage } from './internal'

/**
 * Verify that a spy event has been dispatched with data in event detail
 *
 * @param {Function} spy  - the event handler to inspect
 * @param {Object}   data - data expected inthe event detail
 */
export function toHaveBeenDispatchedWith(spy, data) {
	const detail = spy.mock.lastCall[0].detail
	const pass = equals(detail, data)

	return {
		message: () => getMessage(detail, data, pass),
		pass
	}
}
