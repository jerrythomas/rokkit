import { equals } from '@vitest/expect'
import { getMessage } from './internal'

export function toHaveBeenDispatchedWith(spy, data) {
	const detail = spy.mock.lastCall[0].detail
	const pass = equals(detail, data)

	return {
		message: () => getMessage(detail, data, pass),
		pass
	}
}
