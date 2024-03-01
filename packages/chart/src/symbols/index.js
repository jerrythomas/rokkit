import { namedShapes } from './constants'
import { default as Shape } from './Shape.svelte'
import { default as RoundedSquare } from './RoundedSquare.svelte'

export const shapes = [...Object.keys(namedShapes), 'rounded-square']
export const components = {
	default: Shape,
	'rounded-square': RoundedSquare
}
