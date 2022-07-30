import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import transformer from '@unocss/transformer-directives'
import { extractorSvelte } from '@unocss/core'
// const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export default defineConfig({
	// safelist: [
	// 	shades.map((i) => `bg-primary-${i}`),
	// 	shades.map((i) => `bg-secondary-${i}`),
	// 	shades.map((i) => `bg-accent-${i}`),
	// 	shades.map((i) => `bg-skin-${i}`),
	// 	shades.map((i) => `border-skin-${i}`),
	// 	shades.map((i) => `text-skin-${i}`)
	// ],
	theme: {
		fontFamily: {
			mono: ['Victor-Mono', 'monospace'],
			serif: ['Montserrat Alternates', 'ui-serif', 'sans-serif'],
			body: ['Montserrat Alternates', 'ui-serif', 'sans-serif']
		},
		shortcuts: {
			error: 'red'
		},
		colors: {
			info: 'blue',
			warn: '.yellow',
			pass: '.green',
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
		// fontSize: {
		// 	xs: ['0.75rem', 'var(--du-line-height-normal)'],
		// 	sm: ['0.875rem', 'var(--du-line-height-normal)'],
		// 	base: ['1rem', 'var(--du-line-height-normal)'],
		// 	lg: ['var(--du-text-lg)', 'var(--du-line-height-heading)'],
		// 	xl: ['var(--du-text-xl)', 'var(--du-line-height-heading)'],
		// 	'2xl': ['var(--du-text-2xl)', 'var(--du-line-height-heading)'],
		// 	'3xl': ['var(--du-text-3xl)', 'var(--du-line-height-heading)'],
		// 	'4xl': ['var(--du-text-4xl)', 'var(--du-line-height-heading)']
		// }
	},
	presets: [presetUno(), presetIcons({})],
	extractors: [extractorSvelte],
	transformers: [transformer()]
})
