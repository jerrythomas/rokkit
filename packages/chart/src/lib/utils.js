import { scaledPath } from '@rokkit/core'

export function scaledPathCollection(paths) {
	return Object.entries(paths).reduce(
		(acc, [key, value]) => ({ ...acc, [key]: (s) => scaledPath(s, value) }),
		{}
	)
}
