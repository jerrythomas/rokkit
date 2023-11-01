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
		'-translate-x-full'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
		'action-remove': 'i-rokkit:action-cross',
		'dropdown-opened': 'accordion-opened',
		'bg-error': 'bg-red-100',
		'text-error': 'text-red-800',
		'border-error': 'border-red-700',
		'bg-info': 'bg-blue-100',
		'text-info': 'text-blue-800',
		'border-info': 'border-blue-700',
		'bg-warn': 'bg-yellow-100',
		'text-warn': 'text-yellow-700',
		'border-warn': 'border-yellow-700',
		'bg-pass': 'bg-green-100',
		'text-pass': 'text-green-800',
		'border-pass': 'border-green-700',
		'bg-disabled': 'bg-neutral-100',
		'text-disabled': 'text-neutral-300',
		'border-disabled': 'border-neutral-700',
		'item-selected': 'border-l-3 border-secondary',
		'state-danger': 'text-red',
		svelte: 'i-file:svelte',
		js: 'i-file:js',
		folder: 'i-file:folder',
		css: 'i-file:css',
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-neutral-contrast'
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
		presetUno(),
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
