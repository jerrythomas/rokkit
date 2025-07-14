import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'
import { colors } from '@unocss/preset-mini/colors'
import { importIcons, semanticShortcuts } from '@rokkit/core'
import { iconShortcuts, defaultIcons } from '@rokkit/themes'

const icons = {
	rokkit: '@rokkit/icons/ui.json',
	logo: '@rokkit/icons/auth.json',
	component: '@rokkit/icons/components.json',
	app: '@rokkit/icons/app.json',
	solar: '@iconify-json/solar/icons.json'
}

const components = [
	'list',
	'accordion',
	'select',
	'tree',
	'tabs',
	'input-text',
	'rating',
	'switch-button',
	'range'
].map((icon) => `i-component:${icon}`)

export default defineConfig({
	darkMode: 'attribute',
	extractors: [extractorSvelte()],
	// rules: [...palette],
	safelist: [...defaultIcons, ...components],
	shortcuts: [
		...semanticShortcuts('neutral'),
		...semanticShortcuts('primary'),
		...semanticShortcuts('secondary'),
		...semanticShortcuts('info'),
		...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit'))
	],
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: {
			primary: colors.orange,
			neutral: colors.stone,
			secondary: colors.pink,
			accent: colors.blue,
			error: colors.red,
			warning: colors.yellow,
			success: colors.green,
			info: colors.sky
		}
	},

	presets: [
		presetWind3({
			dark: {
				light: '[data-mode="light"]',
				dark: '[data-mode="dark"]'
			}
		}),
		presetTypography(),
		presetIcons({
			collections: {
				...importIcons(icons),
				file: () =>
					import('./static/icons/files/icons.json', { with: { type: 'json' } }).then(
						(i) => i.default
					)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
