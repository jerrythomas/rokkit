// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { colors } from '@unocss/preset-mini/colors'
import type { PresetMiniColors } from '@unocss/preset-mini/colors'
import syntaxColorPalette from './syntax.json' with { type: 'json' }
import extraColors from './extra.json' with { type: 'json' }

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
export const defaultPalette = [
	'surface',
	'primary',
	'secondary',
	'accent',
	'success',
	'warning',
	'danger',
	'info'
]

export const syntaxColors = syntaxColorPalette
export const defaultColors: PresetMiniColors & typeof extraColors = {
	...colors,
	...extraColors
}
