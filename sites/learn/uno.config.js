import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetUno,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { iconShortcuts, defaultIcons, themeColors, themeRules } from '@rokkit/themes'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

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
]

export default defineConfig({
	extractors: [extractorSvelte()],
	rules: [...themeRules()],
	safelist: [
		...defaultIcons,
		'i-rokkit:navigate-right',
		'navigate-left',
		...components.map((icon) => `i-component:${icon}`),
		'text-neutral-base',
		'text-neutral-subtle',
		'text-neutral-muted',
		'bg-neutral-base',
		'bg-neutral-subtle',
		'bg-neutral-muted',
		'bg-neutral-inset',
		'i-rokkit:github',
		'i-rokkit:menu',
		'i-rokkit:accordion-closed',
		'i-rokkit:heart-filled',
		'i-rokkit:heart-outlined',
		'i-rokkit:folder-opened',
		'i-rokkit:folder-closed',
		'svelte',
		'js',
		'folder',
		'css',
		'array',
		'object',
		'string',
		'number',
		'boolean',
		'-translate-x-full'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
		array: 'i-component:input-array',
		object: 'i-component:input-object',
		string: 'i-component:input-text',
		number: 'i-component:input-number',
		boolean: 'i-component:checkbox'
	},
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
		presetUno({
			dark: 'class'
		}),
		presetTypography(),
		presetIcons({
			collections: {
				rokkit: () => import('@rokkit/icons/ui.json').then((i) => i.default),
				logo: () => import('@rokkit/icons/auth.json').then((i) => i.default),
				component: () => import('@rokkit/icons/components.json').then((i) => i.default),
				file: FileSystemIconLoader('./static/files', (svg) => svg.replace(/black/, 'currentColor'))
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
