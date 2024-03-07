import { defaultThemeMapping, defaultColors, themeRules } from '@rokkit/core'
import customColors from './colors.json'

export const colors = {
	...defaultColors,
	...customColors
}

const mapping = {
	...defaultThemeMapping,
	neutral: 'shark',
	pass: 'norway'
}
export const palette = themeRules('rokkit', mapping, colors)
