import { scaledPath } from '@rokkit/core'
import paths from './shapes.json'

export const namedShapes = Object.entries(paths).reduce(
	(acc, [key, value]) => ({ ...acc, [key]: (s) => scaledPath(s, value) }),
	{}
)

//diamond

// wye
// <path transform="translate(620,15.25)" d="M2.152,1.243L2.152,5.547L-2.152,5.547L-2.152,1.243L-5.88,-0.91L-3.728,-4.638L0,-2.485L3.728,-4.638L5.88,-0.91Z"></path>
//
// outline
