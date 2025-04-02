import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { importIcons } from '@rokkit/core'
import { iconShortcuts, defaultIcons, themeColors, themeRules } from '@rokkit/themes'
export const palette = themeRules('rokkit', { neutral: 'shark' })

const icons = {
	rokkit: '@rokkit/icons/ui.json',
	app: '@rokkit/icons/app.json'
}

export default defineConfig({
	extractors: [extractorSvelte()],
	rules: [...palette],
	safelist: [...defaultIcons],
	shortcuts: iconShortcuts(defaultIcons, 'i-rokkit'),
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: themeColors()
	},
	presets: [
		presetWind3({
			dark: 'class'
		}),
		presetTypography(),
		presetIcons({
			collections: importIcons(icons)
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
