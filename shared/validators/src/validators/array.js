import { getMessage } from './internal'

export const toIncludeAll = (received, expected) => {
	const pass = expected.every((v) => received.includes(v))

	return {
		message: () => getMessage(received, expected, pass, 'include all of'),
		pass
	}
}
