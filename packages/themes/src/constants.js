import { themeColors, themeRules } from '@rokkit/core'
export { defaultStateIcons, defaultIcons } from '@rokkit/core'
export const defaultThemeColors = themeColors()

export const palettes = {
	rokkit: themeRules(),
	'sea-green': themeRules('sea-green', { primary: 'teal', secondary: 'sky', accent: 'lime' })
}
