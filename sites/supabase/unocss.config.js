import { defineConfig } from 'unocss'
import { extractorSvelte } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
// import { iconShortcuts } from '@svelte-spice/core/themes'
// const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export default defineConfig({
	safelist: [
		// ...Object.keys(iconShortcuts),
		'i-iconoir-input-field',
		'i-carbon-tree-view',
		'i-carbon:tree-view-alt',
		'i-carbon:list-dropdown',
		'i-carbon-chevron-sort',
		'logo-magic',
		'logo-google',
		'logo-facebook',
		'logo-twitter',
		'logo-github',
		'logo-linkedin',
		'logo-apple',
		'logo-mail',
		'logo-phone'
	],
	shortcuts: {
		// ...iconShortcuts,
		'logo-magic': 'i-carbon:link',
		'logo-google': 'i-flat-color-icons-google',
		'logo-facebook': 'i-entypo-social-facebook',
		'logo-twitter': 'i-entypo-social-twitter',
		'logo-github': 'i-entypo-social-github',
		'logo-linkedin': 'i-entypo-social-linkedin',
		'logo-apple': 'i-fa-brands-apple',
		'logo-mail': 'i-eva-email-outline',
		'logo-phone': 'i-eva-phone-fill',
		'bg-error': 'bg-red-100',
		'text-error': 'text-red-800',
		'border-error': 'border-red-700',
		'bg-info': 'bg-blue-100',
		'text-info': 'text-blue-800',
		'border-info': 'border-blue-700',
		'bg-warn': 'bg-orange-100',
		'text-warn': 'text-orange-800',
		'border-warn': 'border-orange-700',
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
			serif: ['Roboto', 'ui-sans-serif', 'sans-serif'],
			body: ['Roboto', 'ui-sans-serif', 'sans-serif']
		},
		colors: {
			primary: {
				DEFAULT: 'hsl(var(--primary-500))',
				50: 'hsl(var(--primary-50))',
				100: 'hsl(var(--primary-100))',
				200: 'hsl(var(--primary-200))',
				300: 'hsl(var(--primary-300))',
				400: 'hsl(var(--primary-400))',
				500: 'hsl(var(--primary-500))',
				600: 'hsl(var(--primary-600))',
				700: 'hsl(var(--primary-700))',
				800: 'hsl(var(--primary-800))',
				900: 'hsl(var(--primary-900))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary-500))',
				50: 'hsl(var(--secondary-50))',
				100: 'hsl(var(--secondary-100))',
				200: 'hsl(var(--secondary-200))',
				300: 'hsl(var(--secondary-300))',
				400: 'hsl(var(--secondary-400))',
				500: 'hsl(var(--secondary-500))',
				600: 'hsl(var(--secondary-600))',
				700: 'hsl(var(--secondary-700))',
				800: 'hsl(var(--secondary-800))',
				900: 'hsl(var(--secondary-900))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent-500))',
				50: 'hsl(var(--accent-50))',
				100: 'hsl(var(--accent-100))',
				200: 'hsl(var(--accent-200))',
				300: 'hsl(var(--accent-300))',
				400: 'hsl(var(--accent-400))',
				500: 'hsl(var(--accent-500))',
				600: 'hsl(var(--accent-600))',
				700: 'hsl(var(--accent-700))',
				800: 'hsl(var(--accent-800))',
				900: 'hsl(var(--accent-900))'
			},
			skin: {
				DEFAULT: 'hsl(var(--skin-500))',
				base: 'hsl(var(--skin-50))',
				contrast: 'hsl(var(--skin-900))',
				zebra: 'hsl(var(--skin-zebra))',
				50: 'hsl(var(--skin-50))',
				100: 'hsl(var(--skin-100))',
				200: 'hsl(var(--skin-200))',
				300: 'hsl(var(--skin-300))',
				400: 'hsl(var(--skin-400))',
				500: 'hsl(var(--skin-500))',
				600: 'hsl(var(--skin-600))',
				700: 'hsl(var(--skin-700))',
				800: 'hsl(var(--skin-800))',
				900: 'hsl(var(--skin-900))'
			}
		}
	},
	presets: [presetUno(), presetIcons({})],
	extractors: [extractorSvelte],
	transformers: [transformer()]
})
