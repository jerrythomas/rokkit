import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetUno,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { iconShortcuts, defaultIcons, themeColors } from '@rokkit/themes'
import { palette } from './src/lib/config'

export default defineConfig({
	extractors: [extractorSvelte()],
	rules: [...palette],
	safelist: [...defaultIcons],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit')
	},
	theme: {
		// fontFamily: {
		// 	mono: ['Victor Mono', 'monospace'],
		// 	heading: ['Open Sans', 'sans-serif'],
		// 	sans: ['Overpass', 'ui-serif', 'sans-serif'],
		// 	body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		// },
		colors: themeColors()
	},
	presets: [
		presetUno(),
		presetTypography(),
		presetIcons({
			collections: {
				rokkit: () => import('@rokkit/icons/ui.json').then((i) => i.default)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
