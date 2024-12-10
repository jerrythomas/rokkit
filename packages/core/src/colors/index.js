import defaultTailwindColors from './tailwind.json' with { type: 'json' }
import syntaxColorPalette from './syntax.json' with { type: 'json' }

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
export const defaultPalette = [
	'neutral',
	'primary',
	'secondary',
	'accent',
	'success',
	'warning',
	'danger',
	'info'
]

export const syntaxColors = syntaxColorPalette
export const defaultColors = {
	...defaultTailwindColors
}
