import { scaledPath } from '@rokkit/core'
import paths from './patterns.json'

export const patterns = Object.entries(paths).reduce(
	(acc, [key, value]) => ({ ...acc, [key]: (s) => scaledPath(s, value) }),
	{}
)
