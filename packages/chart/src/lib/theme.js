import { builtIn as patterns } from './pattern'
import { namedShapes as shapes } from './shape'
import { builtIn as symbols } from './shape'
import { colors, palette } from './color'
/**
 *
 */
export class ThemeBrewer {
	constructor() {
		this.patterns = []
		this.shapes = []
		this.palette = []
		this.defaults = {}
	}
}

export const builtIn = {
	colors,
	palette,
	patterns,
	shapes,
	symbols,
	tick: {
		size: {
			major: 6,
			minor: 4,
			end: 6,
			padding: 3
		}
	}
}
