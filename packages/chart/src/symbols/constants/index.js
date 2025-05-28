import { scaledPathCollection } from '../../old_lib/utils'
import paths from './shapes.json' with { type: 'json' }

export const namedShapes = scaledPathCollection(paths)
