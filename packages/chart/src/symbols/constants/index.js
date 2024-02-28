import { scaledPath } from '@rokkit/core'
import paths from './shapes.json'

export const namedShapes = Object.entries(paths).reduce(
	(acc, [key, value]) => ({ ...acc, [key]: (s) => scaledPath(s, value) }),
	{}
)
