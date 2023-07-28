import { scaledPath } from '@rokkit/core'
import shapes from './constants/shapes.json'

export const symbols = Object.entries(shapes).reduce(
	(acc, [key, value]) => ({ ...acc, [key]: (s) => scaledPath(s, value) }),
	{}
)
