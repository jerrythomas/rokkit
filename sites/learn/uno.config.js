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
const mapping = { surface: 'shark' }
const theme = new Theme()
const icons = {
	rokkit: '@rokkit/icons/ui.json',
	logo: '@rokkit/icons/auth.json',
	component: '@rokkit/icons/components.json',
	app: '@rokkit/icons/app.json',
	solar: '@iconify-json/solar/icons.json'
}

const components = [
	'accordion',
	'button',
	'card',
	'calendar',
	'carousel',
	'checkbox',
	'combobox',
	'crumbs',
	'dropdown',
	'icon',
	'input-text',
	'item',
	'list',
	'message',
	'palette',
	'pill',
	'progress',
	'range',
	'multiselect',
	'select',
	'settings',
	'stepper',
	'switch',
	'tabs',
	'table',
	'tree',
	'radio',
	'range',
	'rating'
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
	rules: [['hidden', { display: 'none' }]],
	safelist: [
		...defaultIcons,
		...components,
		defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}`)),
		defaultPalette.flatMap((color) => shades.map((shade) => `bg-${color}-${shade}/50`)),
		'i-solar:calendar-bold-duotone',
		'i-solar:sidebar-bold-duotone',
		'i-solar:rocket-bold-duotone'
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
				error: 'rose',
				success: 'lime',
				surface: 'zinc',
				warning: 'amber',
				info: 'indigo'
			})
		],
		...theme.getShortcuts('surface'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('accent'),
		...theme.getShortcuts('info'),
		...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit')),
		['text-on-primary', 'text-surface-50'],
		['text-on-secondary', 'text-surface-50'],
		['text-on-info', 'text-surface-50'],
		['text-on-success', 'text-surface-50'],
		['text-on-warning', 'text-surface-50'],
		['text-on-error', 'text-surface-50'],
		['text-on-surface', 'text-surface-50']
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
