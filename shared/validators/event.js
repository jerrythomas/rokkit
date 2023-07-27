import { equals } from '@vitest/expect'

export function toHaveBeenDispatchedWith(spy, data) {
	const detail = spy.mock.lastCall[0].detail
	const pass = equals(detail, data)
	const text = pass ? ' to not' : ''
	const expected = JSON.stringify(detail)
	const received = JSON.stringify(data)

	return {
		message: () => `expected ${expected}${text} deeply equal ${received}`,
		pass
	}
}
