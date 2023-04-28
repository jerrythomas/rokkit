import { defineConfig } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import presetTypography from '@unocss/preset-typography'
import { iconShortcuts, defaultIcons, themeColors } from '@rokkit/themes'
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
	safelist: [
		...defaultIcons,
		...components.map((icon) => `i-component:${icon}`),
		'text-skin-base',
		'text-skin-subtle',
		'text-skin-muted',
		'bg-skin-base',
		'bg-skin-subtle',
		'bg-skin-muted',
		'bg-skin-inset',
		'i-rokkit:github',
		'i-rokkit:menu',
		'i-rokkit:accordion-closed',
		'i-rokkit:heart-filled',
		'i-rokkit:heart-outlined',
		'i-rokkit:folder-opened',
		'i-rokkit:folder-closed',
		'i-file:svelte',
		'i-file:js',
		'-translate-x-full'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
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
		'bg-disabled': 'bg-skin-100',
		'text-disabled': 'text-skin-300',
		'border-disabled': 'border-skin-700',
		'item-selected': 'border-l-3 border-secondary',
		'state-danger': 'text-red',
		svelte: 'i-file:svelte',
		js: 'i-file:js',
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-skin-contrast'
	},
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			serif: ['Poppins', 'ui-serif', 'sans-serif'],
			body: [
				'Overpass',
				'-apple-system',
				'system-ui',
				'Segoe-UI',
				'ui-serif',
				'sans-serif'
			]
		},
		colors: themeColors('hsl')
	},
	presets: [
		presetUno(),
		presetTypography(),
		presetIcons({
			collections: {
				rokkit: FileSystemIconLoader('./static/icons', (svg) =>
					svg.replace(/black/, 'currentColor')
				),
				component: FileSystemIconLoader('./static/components', (svg) =>
					svg.replace(/black/, 'currentColor')
				),
				file: FileSystemIconLoader('./static/files', (svg) =>
					svg.replace(/black/, 'currentColor')
				)
			}
		})
	],
	transformers: [transformer()]
})
