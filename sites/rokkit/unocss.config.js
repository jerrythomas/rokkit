import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import presetTypography from '@unocss/preset-typography'
import { extractorSvelte } from '@unocss/core'
import { iconShortcuts, defaultIcons, themeColors } from '@rokkit/themes'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { components } from './src/lib'

// console.log(iconShortcuts(defaultIcons, 'i-spice'))
export default defineConfig({
	safelist: [
		...defaultIcons,
		...components.map(({ icon }) => icon),
		'i-spice:github',
		'i-states:accordion-closed',
		'i-spice:accordion-closed',
		'i-spice-states:accordion-closed'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-spice'),
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
		'item-hover':
			'bg-gradient-to-r from-primary-200 via-primary-200 bg-secondary-200 text-skin-contrast'
	},
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			serif: ['Poppins', 'ui-serif', 'sans-serif'],
			body: ['Poppins', 'ui-serif', 'sans-serif']
		},
		colors: themeColors('hsl')
	},
	presets: [
		presetUno(),
		presetTypography({
			cssExtend: {
				'font-mono': 'Victor Mono'
				// 'font-size': '14px'
			}
		}),
		presetIcons({
			collections: {
				// cx :
				spice: FileSystemIconLoader('./static/icons', (svg) =>
					svg.replace(/black/, 'currentColor')
				),
				component: FileSystemIconLoader('./static/components', (svg) =>
					svg.replace(/black/, 'currentColor')
				)
			}
		})
	],
	extractors: [extractorSvelte],
	transformers: [transformer()]
})
