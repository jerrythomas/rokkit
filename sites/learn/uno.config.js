import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { importIcons, shades, defaultPalette } from '@rokkit/core'
import { iconShortcuts, defaultIcons, Theme } from '@rokkit/themes'
const mapping = { neutral: 'shark' }
const theme = new Theme()
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

const themeConfig = {
	dark: {
		light: '[data-mode="light"]',
		dark: '[data-mode="dark"]'
	}
}
export default defineConfig({
	darkMode: 'attribute',
	extractors: [extractorSvelte()],
	// rules: [],
	safelist: [
		...defaultIcons,
		...components,
		defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}`)),
		defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}/50`))
	],
	shortcuts: [
		['skin-default', theme.getPalette(mapping)],
		['skin-vibrant', theme.getPalette({ primary: 'blue', secondary: 'purple' })],
		[
			'skin-seaweed',
			theme.getPalette({
				primary: 'sky',
				secondary: 'green',
				accent: 'blue',
				danger: 'rose',
				success: 'lime',
				neutral: 'zinc',
				warning: 'amber',
				info: 'indigo'
			})
		],
		...theme.getShortcuts('neutral'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('info'),
		...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit')),
		['text-on-primary', 'text-neutral-50'],
		['text-on-secondary', 'text-neutral-50'],
		['text-on-info', 'text-neutral-50'],
		['text-on-success', 'text-neutral-50'],
		['text-on-warning', 'text-neutral-50'],
		['text-on-error', 'text-neutral-50']
	],
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: theme.getColorRules(mapping)
	},

	presets: [
		presetWind3(themeConfig),
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
