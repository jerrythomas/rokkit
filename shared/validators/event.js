import { equals } from '@vitest/expect'
export function toHaveBeenCalledWithDetail(spy, data) {
	const detail = spy.mock.lastCall[0].detail
	const pass = equals(detail.detail, data)

	if (pass) {
		return {
			message: () =>
				`expected ${JSON.stringify(detail)} to deeply equal ${JSON.stringify(
					data
				)}`,
			pass: true
		}
	} else {
		return {
			message: () =>
				`expected ${JSON.stringify(
					detail
				)} to not deeply equal ${JSON.stringify(data)}`,
			pass: false
		}
	}
}
