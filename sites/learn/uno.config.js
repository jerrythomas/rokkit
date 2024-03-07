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
export const palette = themeRules('rokkit')

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
	rules: [...palette],
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
		'type-array',
		'type-object',
		'type-string',
		'type-number',
		'type-boolean',
		'-translate-x-full'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
		'type-array': 'i-component:input-array',
		'type-object': 'i-component:input-object',
		'type-string': 'i-component:input-text',
		'type-number': 'i-component:input-number',
		'type-boolean': 'i-component:checkbox',
		'sort-descending': 'i-solar:sort-from-bottom-to-top-line-duotone',
		'sort-ascending': 'i-solar:sort-from-top-to-bottom-line-duotone',
		'sort-desc': 'i-solar:sort-from-bottom-to-top-line-duotone',
		'sort-asc': 'i-solar:sort-from-top-to-bottom-line-duotone',
		'sort-none': 'i-solar:sort-vertical-line-duotone'
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
				file: FileSystemIconLoader('./static/icons/files', (svg) =>
					svg.replace(/black/, 'currentColor')
				),
				app: FileSystemIconLoader('./static/icons/app', (svg) =>
					svg.replace(/black/, 'currentColor')
				),
				solar: () => import('@iconify-json/solar/icons.json').then((i) => i.default)
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
