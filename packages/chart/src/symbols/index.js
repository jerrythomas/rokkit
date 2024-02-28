import { namedShapes } from './constants'
import { default as Circle } from './Circle.svelte'
import { default as Square } from './Square.svelte'
import { default as Triangle } from './Triangle.svelte'
import { default as Shape } from './Shape.svelte'

export const shapes = ['circle', 'square', 'triangle', ...Object.keys(namedShapes)]
export const components = {
	circle: Circle,
	square: Square,
	triangle: Triangle,
	default: Shape
}
