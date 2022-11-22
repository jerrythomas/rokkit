import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import { extractorSvelte } from '@unocss/core'
import { iconShortcuts, themeColors } from '@svelte-spice/themes'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

const inputIcons = [
	'text',
	'number',
	'email',
	'url',
	'array',
	'tel',
	'time',
	'date',
	'color',
	'password'
].map((type) => 'i-sparsh:input-' + type)

export default defineConfig({
	safelist: [
		...Object.keys(iconShortcuts),
		'i-carbon-tree-view',
		'i-carbon:tree-view-alt',
		'i-carbon:list-dropdown',
		'i-carbon-chevron-sort',
		...inputIcons
	],
	shortcuts: {
		...iconShortcuts,
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
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-skin-contrast'
	},
	theme: {
		fontFamily: {
			mono: ['Victor-Mono', 'monospace'],
			serif: ['Montserrat Alternates', 'ui-serif', 'sans-serif'],
			body: ['Montserrat Alternates', 'ui-serif', 'sans-serif']
		},
		colors: themeColors()
	},
	presets: [
		presetUno(),
		presetIcons({
			collections: {
				sparsh: FileSystemIconLoader('./static/assets', (svg) =>
					svg.replace(/black/, 'currentColor')
				)
			}
		})
	],
	extractors: [extractorSvelte],
	transformers: [transformer()]
})
