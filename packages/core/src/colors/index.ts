import { colors } from '@unocss/preset-mini/colors'
import syntaxColorPalette from './syntax.json' with { type: 'json' }
import extraColors from './extra.json' with { type: 'json' }

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
export const defaultPalette = [
	'surface',
	'primary',
	'secondary',
	'tertiary',
	'accent',
	'success',
	'warning',
	'danger',
	'info'
]

export const syntaxColors = syntaxColorPalette
// `typeof colors`: preset-mini 66 no longer exports a `PresetMiniColors` type — the value is
// the source of truth for its own shape.
export const defaultColors: typeof colors & typeof extraColors = {
	...colors,
	...extraColors
}

export { categoricalPalette, categoricalFamilies } from './brewer.js'
