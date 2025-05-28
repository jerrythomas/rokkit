import { describe, it, expect } from 'vitest'
import { shadesOf, stateColors, themeColors, contrastColors, themeRules } from '../src/theme'
import contrast from './fixtures/contrast.json'
describe('theme', () => {
	const palettes = ['primary', 'secondary', 'other']

	describe('shadesOf', () => {
		it.each(palettes)('should generate shades without a modifier', (name) => {
			const result = shadesOf(name)
			expect(result).toEqual({
				50: `rgb(var(--${name}-50) / <alpha-value>)`,
				100: `rgb(var(--${name}-100) / <alpha-value>)`,
				200: `rgb(var(--${name}-200) / <alpha-value>)`,
				300: `rgb(var(--${name}-300) / <alpha-value>)`,
				400: `rgb(var(--${name}-400) / <alpha-value>)`,
				500: `rgb(var(--${name}-500) / <alpha-value>)`,
				600: `rgb(var(--${name}-600) / <alpha-value>)`,
				700: `rgb(var(--${name}-700) / <alpha-value>)`,
				800: `rgb(var(--${name}-800) / <alpha-value>)`,
				900: `rgb(var(--${name}-900) / <alpha-value>)`,
				950: `rgb(var(--${name}-950) / <alpha-value>)`,
				DEFAULT: `rgb(var(--${name}-500) / <alpha-value>)`,
				inset: `rgb(var(--${name}-100) / <alpha-value>)`,
				base: `rgb(var(--${name}-50) / <alpha-value>)`,
				subtle: `rgb(var(--${name}-200) / <alpha-value>)`,
				muted: `rgb(var(--${name}-300) / <alpha-value>)`,
				raised: `rgb(var(--${name}-400) / <alpha-value>)`,
				elevated: `rgb(var(--${name}-600) / <alpha-value>)`,
				floating: `rgb(var(--${name}-700) / <alpha-value>)`,
				contrast: `rgb(var(--${name}-800) / <alpha-value>)`,
				overlay: `rgb(var(--${name}-900) / <alpha-value>)`
			})
		})

		it.each(palettes)('should generate shades using hsl modifier', (name) => {
			const result = shadesOf(name, 'hsl')
			expect(result).toEqual({
				50: `hsl(var(--${name}-50) / <alpha-value>)`,
				100: `hsl(var(--${name}-100) / <alpha-value>)`,
				200: `hsl(var(--${name}-200) / <alpha-value>)`,
				300: `hsl(var(--${name}-300) / <alpha-value>)`,
				400: `hsl(var(--${name}-400) / <alpha-value>)`,
				500: `hsl(var(--${name}-500) / <alpha-value>)`,
				600: `hsl(var(--${name}-600) / <alpha-value>)`,
				700: `hsl(var(--${name}-700) / <alpha-value>)`,
				800: `hsl(var(--${name}-800) / <alpha-value>)`,
				900: `hsl(var(--${name}-900) / <alpha-value>)`,
				950: `hsl(var(--${name}-950) / <alpha-value>)`,
				DEFAULT: `hsl(var(--${name}-500) / <alpha-value>)`,
				inset: `hsl(var(--${name}-100) / <alpha-value>)`,
				base: `hsl(var(--${name}-50) / <alpha-value>)`,
				subtle: `hsl(var(--${name}-200) / <alpha-value>)`,
				muted: `hsl(var(--${name}-300) / <alpha-value>)`,
				raised: `hsl(var(--${name}-400) / <alpha-value>)`,
				elevated: `hsl(var(--${name}-600) / <alpha-value>)`,
				floating: `hsl(var(--${name}-700) / <alpha-value>)`,
				contrast: `hsl(var(--${name}-800) / <alpha-value>)`,
				overlay: `hsl(var(--${name}-900) / <alpha-value>)`
			})
		})
		it.each(palettes)('should generate shades using rgb modifier', (name) => {
			const result = shadesOf(name, 'rgb')
			expect(result).toEqual({
				50: `rgb(var(--${name}-50) / <alpha-value>)`,
				100: `rgb(var(--${name}-100) / <alpha-value>)`,
				200: `rgb(var(--${name}-200) / <alpha-value>)`,
				300: `rgb(var(--${name}-300) / <alpha-value>)`,
				400: `rgb(var(--${name}-400) / <alpha-value>)`,
				500: `rgb(var(--${name}-500) / <alpha-value>)`,
				600: `rgb(var(--${name}-600) / <alpha-value>)`,
				700: `rgb(var(--${name}-700) / <alpha-value>)`,
				800: `rgb(var(--${name}-800) / <alpha-value>)`,
				900: `rgb(var(--${name}-900) / <alpha-value>)`,
				950: `rgb(var(--${name}-950) / <alpha-value>)`,
				DEFAULT: `rgb(var(--${name}-500) / <alpha-value>)`,
				base: `rgb(var(--${name}-50) / <alpha-value>)`,
				inset: `rgb(var(--${name}-100) / <alpha-value>)`,
				subtle: `rgb(var(--${name}-200) / <alpha-value>)`,
				muted: `rgb(var(--${name}-300) / <alpha-value>)`,
				raised: `rgb(var(--${name}-400) / <alpha-value>)`,
				elevated: `rgb(var(--${name}-600) / <alpha-value>)`,
				floating: `rgb(var(--${name}-700) / <alpha-value>)`,
				contrast: `rgb(var(--${name}-800) / <alpha-value>)`,
				overlay: `rgb(var(--${name}-900) / <alpha-value>)`
			})
		})
		it.each(palettes)('should generate shades with invalid modifier', (name) => {
			const result = shadesOf(name, 'invalid')
			expect(result).toEqual({
				50: `rgb(var(--${name}-50) / <alpha-value>)`,
				100: `rgb(var(--${name}-100) / <alpha-value>)`,
				200: `rgb(var(--${name}-200) / <alpha-value>)`,
				300: `rgb(var(--${name}-300) / <alpha-value>)`,
				400: `rgb(var(--${name}-400) / <alpha-value>)`,
				500: `rgb(var(--${name}-500) / <alpha-value>)`,
				600: `rgb(var(--${name}-600) / <alpha-value>)`,
				700: `rgb(var(--${name}-700) / <alpha-value>)`,
				800: `rgb(var(--${name}-800) / <alpha-value>)`,
				900: `rgb(var(--${name}-900) / <alpha-value>)`,
				950: `rgb(var(--${name}-950) / <alpha-value>)`,
				DEFAULT: `rgb(var(--${name}-500) / <alpha-value>)`,
				inset: `rgb(var(--${name}-100) / <alpha-value>)`,
				base: `rgb(var(--${name}-50) / <alpha-value>)`,
				subtle: `rgb(var(--${name}-200) / <alpha-value>)`,
				muted: `rgb(var(--${name}-300) / <alpha-value>)`,
				raised: `rgb(var(--${name}-400) / <alpha-value>)`,
				elevated: `rgb(var(--${name}-600) / <alpha-value>)`,
				floating: `rgb(var(--${name}-700) / <alpha-value>)`,
				contrast: `rgb(var(--${name}-800) / <alpha-value>)`,
				overlay: `rgb(var(--${name}-900) / <alpha-value>)`
			})
		})
	})

	describe('stateColors', () => {
		it.each(['info', 'error', 'warn', 'pass'])(
			'should generate shades for states using names',
			(name) => {
				const result = stateColors(name, 'hsl')
				expect(result).toEqual({
					DEFAULT: `hsl(var(--${name}-500) / <alpha-value>)`,
					light: `hsl(var(--${name}-200) / <alpha-value>)`,
					dark: `hsl(var(--${name}-700) / <alpha-value>)`
				})
			}
		)
	})

	describe('themeColors', () => {
		it('should generate theme color palette', () => {
			const result = themeColors('hsl')
			const palette = {
				accent: shadesOf('accent', 'hsl'),
				primary: shadesOf('primary', 'hsl'),
				secondary: shadesOf('secondary', 'hsl'),
				neutral: {
					...shadesOf('neutral', 'hsl'),
					zebra: 'hsl(var(--neutral-zebra) / <alpha-value>)'
				},
				info: stateColors('info', 'hsl'),
				error: stateColors('error', 'hsl'),
				danger: stateColors('danger', 'hsl'),
				warning: stateColors('warning', 'hsl'),
				success: stateColors('success', 'hsl')
			}

			expect(result).toEqual(palette)
		})
		it.each([null, 'invalid'])('should handle invalid/missing modifier', (modifier) => {
			const result = modifier ? themeColors(modifier) : themeColors()
			const palette = {
				accent: shadesOf('accent'),
				primary: shadesOf('primary'),
				secondary: shadesOf('secondary'),
				neutral: {
					...shadesOf('neutral'),
					zebra: 'rgb(var(--neutral-zebra) / <alpha-value>)'
				},
				info: stateColors('info'),
				error: stateColors('error'),
				danger: stateColors('danger'),
				warning: stateColors('warning'),
				success: stateColors('success')
			}

			expect(result).toEqual(palette)
		})
	})

	describe('contrastColors', () => {
		it('should generate contrast colors', () => {
			const result = contrastColors('#ffffff', '#000000')
			expect(result).toEqual(contrast)
		})
	})

	describe('themeRules', () => {
		const lightModeRules = [
			'rokkit-mode-light',
			{
				'--danger-100': '254 226 226',
				'--danger-200': '254 202 202',
				'--danger-300': '252 165 165',
				'--danger-400': '248 113 113',
				'--danger-50': '254 242 242',
				'--danger-500': '239 68 68',
				'--danger-600': '220 38 38',
				'--danger-700': '185 28 28',
				'--danger-800': '153 27 27',
				'--danger-900': '127 29 29',
				'--danger-950': '69 10 10',
				'--error-100': '254 226 226',
				'--error-200': '254 202 202',
				'--error-300': '252 165 165',
				'--error-400': '248 113 113',
				'--error-50': '254 242 242',
				'--error-500': '239 68 68',
				'--error-600': '220 38 38',
				'--error-700': '185 28 28',
				'--error-800': '153 27 27',
				'--error-900': '127 29 29',
				'--error-950': '69 10 10',
				'--info-100': '207 250 254',
				'--info-200': '165 243 252',
				'--info-300': '103 232 249',
				'--info-400': '34 211 238',
				'--info-50': '236 254 255',
				'--info-500': '6 182 212',
				'--info-600': '8 145 178',
				'--info-700': '14 116 144',
				'--info-800': '21 94 117',
				'--info-900': '22 78 99',
				'--info-950': '8 51 68',
				'--neutral-100': '241 245 249',
				'--neutral-200': '226 232 240',
				'--neutral-300': '203 213 224',
				'--neutral-400': '148 163 184',
				'--neutral-50': '248 250 252',
				'--neutral-500': '100 116 139',
				'--neutral-600': '71 85 105',
				'--neutral-700': '51 65 85',
				'--neutral-800': '30 41 59',
				'--neutral-900': '15 23 42',
				'--neutral-950': '2 6 23',
				'--primary-100': '255 237 213',
				'--primary-200': '254 215 170',
				'--primary-300': '253 186 116',
				'--primary-400': '251 146 60',
				'--primary-50': '255 247 237',
				'--primary-500': '249 115 22',
				'--primary-600': '234 88 12',
				'--primary-700': '194 65 12',
				'--primary-800': '154 52 18',
				'--primary-900': '124 45 18',
				'--primary-950': '67 20 7',
				'--secondary-100': '252 231 243',
				'--secondary-200': '251 207 232',
				'--secondary-300': '249 168 212',
				'--secondary-400': '244 114 182',
				'--secondary-50': '253 242 248',
				'--secondary-500': '236 72 153',
				'--secondary-600': '219 39 119',
				'--secondary-700': '190 24 93',
				'--secondary-800': '157 23 77',
				'--secondary-900': '131 24 67',
				'--secondary-950': '80 7 36',
				'--success-100': '220 252 231',
				'--success-200': '187 247 208',
				'--success-300': '134 239 172',
				'--success-400': '74 222 128',
				'--success-50': '240 253 244',
				'--success-500': '34 197 94',
				'--success-600': '22 163 74',
				'--success-700': '21 128 61',
				'--success-800': '22 101 52',
				'--success-900': '20 83 45',
				'--success-950': '5 46 22',
				'--warning-100': '254 249 195',
				'--warning-200': '254 240 138',
				'--warning-300': '253 224 71',
				'--warning-400': '250 204 21',
				'--warning-50': '254 252 232',
				'--warning-500': '234 179 8',
				'--warning-600': '202 138 4',
				'--warning-700': '161 98 7',
				'--warning-800': '133 77 14',
				'--warning-900': '113 63 18',
				'--warning-950': '66 32 6',
				'--accent-100': '224 242 254',
				'--accent-200': '186 230 253',
				'--accent-300': '125 211 252',
				'--accent-400': '56 189 248',
				'--accent-50': '240 249 255',
				'--accent-500': '14 165 233',
				'--accent-600': '2 132 199',
				'--accent-700': '3 105 161',
				'--accent-800': '7 89 133',
				'--accent-900': '12 74 110',
				'--accent-950': '8 47 73',
				'--code-atrule': 'var(--code-string)',
				// '--code-bg': 'var(--neutral-100)',
				'--code-comment': '#969896',
				'--code-cursor': '#24292e',
				'--code-cursor-block': 'rgba(20, 255, 20, 0.5)',
				'--code-fill': 'var(--neutral-100)',
				'--code-function': '#a71d5d',
				'--code-gutter-marker': 'black',
				'--code-gutter-subtle': '#999',
				'--code-keyword': '#3080B5',
				'--code-linenumbers': 'rgba(27, 31, 35, 0.3)',
				'--code-normal': '#333333',
				'--code-number': '#71A15D',
				'--code-operator': '#bf5625',
				'--code-property': '#63a35c',
				'--code-selector': 'var(--code-keyword)',
				'--code-string': '#9D8248',
				'--tab-size': '2'
			}
		]
		const darkModeRules = [
			'rokkit-mode-dark',
			{
				'--danger-100': '127 29 29',
				'--danger-200': '153 27 27',
				'--danger-300': '185 28 28',
				'--danger-400': '220 38 38',
				'--danger-50': '69 10 10',
				'--danger-500': '239 68 68',
				'--danger-600': '248 113 113',
				'--danger-700': '252 165 165',
				'--danger-800': '254 202 202',
				'--danger-900': '254 226 226',
				'--danger-950': '254 242 242',
				'--error-100': '127 29 29',
				'--error-200': '153 27 27',
				'--error-300': '185 28 28',
				'--error-400': '220 38 38',
				'--error-50': '69 10 10',
				'--error-500': '239 68 68',
				'--error-600': '248 113 113',
				'--error-700': '252 165 165',
				'--error-800': '254 202 202',
				'--error-900': '254 226 226',
				'--error-950': '254 242 242',
				'--info-100': '22 78 99',
				'--info-200': '21 94 117',
				'--info-300': '14 116 144',
				'--info-400': '8 145 178',
				'--info-50': '8 51 68',
				'--info-500': '6 182 212',
				'--info-600': '34 211 238',
				'--info-700': '103 232 249',
				'--info-800': '165 243 252',
				'--info-900': '207 250 254',
				'--info-950': '236 254 255',
				'--neutral-100': '15 23 42',
				'--neutral-200': '30 41 59',
				'--neutral-300': '51 65 85',
				'--neutral-400': '71 85 105',
				'--neutral-50': '2 6 23',
				'--neutral-500': '100 116 139',
				'--neutral-600': '148 163 184',
				'--neutral-700': '203 213 224',
				'--neutral-800': '226 232 240',
				'--neutral-900': '241 245 249',
				'--neutral-950': '248 250 252',
				'--primary-100': '124 45 18',
				'--primary-200': '154 52 18',
				'--primary-300': '194 65 12',
				'--primary-400': '234 88 12',
				'--primary-50': '67 20 7',
				'--primary-500': '249 115 22',
				'--primary-600': '251 146 60',
				'--primary-700': '253 186 116',
				'--primary-800': '254 215 170',
				'--primary-900': '255 237 213',
				'--primary-950': '255 247 237',
				'--secondary-100': '131 24 67',
				'--secondary-200': '157 23 77',
				'--secondary-300': '190 24 93',
				'--secondary-400': '219 39 119',
				'--secondary-50': '80 7 36',
				'--secondary-500': '236 72 153',
				'--secondary-600': '244 114 182',
				'--secondary-700': '249 168 212',
				'--secondary-800': '251 207 232',
				'--secondary-900': '252 231 243',
				'--secondary-950': '253 242 248',
				'--success-100': '20 83 45',
				'--success-200': '22 101 52',
				'--success-300': '21 128 61',
				'--success-400': '22 163 74',
				'--success-50': '5 46 22',
				'--success-500': '34 197 94',
				'--success-600': '74 222 128',
				'--success-700': '134 239 172',
				'--success-800': '187 247 208',
				'--success-900': '220 252 231',
				'--success-950': '240 253 244',
				'--warning-100': '113 63 18',
				'--warning-200': '133 77 14',
				'--warning-300': '161 98 7',
				'--warning-400': '202 138 4',
				'--warning-50': '66 32 6',
				'--warning-500': '234 179 8',
				'--warning-600': '250 204 21',
				'--warning-700': '253 224 71',
				'--warning-800': '254 240 138',
				'--warning-900': '254 249 195',
				'--warning-950': '254 252 232',
				'--accent-100': '12 74 110',
				'--accent-200': '7 89 133',
				'--accent-300': '3 105 161',
				'--accent-400': '2 132 199',
				'--accent-50': '8 47 73',
				'--accent-500': '14 165 233',
				'--accent-600': '56 189 248',
				'--accent-700': '125 211 252',
				'--accent-800': '186 230 253',
				'--accent-900': '224 242 254',
				'--accent-950': '240 249 255',
				'--code-atrule': 'var(--code-string)',
				// '--code-bg': 'var(--neutral-100)',
				'--code-comment': '#5c6370',
				'--code-cursor': '#24292e',
				'--code-cursor-block': 'rgba(20, 255, 20, 0.5)',
				'--code-fill': 'var(--neutral-100)',
				'--code-function': '#61afef',
				'--code-gutter-marker': 'black',
				'--code-gutter-subtle': '#999',
				'--code-keyword': '#c678dd',
				'--code-linenumbers': 'rgba(27, 31, 35, 0.3)',
				'--code-normal': '#e06c75',
				'--code-number': '#d19a66',
				'--code-operator': '#56b6c2',
				'--code-property': '#d19a66',
				'--code-selector': 'var(--code-keyword)',
				'--code-string': '#98c379',
				'--tab-size': '2'
			}
		]

		it('should generate theme rules', () => {
			const result = themeRules()

			expect(result[0]).toEqual(lightModeRules)
			expect(result[1]).toEqual(darkModeRules)
		})

		it('should generate theme rules with alternative name', () => {
			const result = themeRules('orange')

			expect(result[0][0]).toEqual('orange-mode-light')
			expect(result[0][1]).toEqual(lightModeRules[1])
			expect(result[1][0]).toEqual('orange-mode-dark')
			expect(result[1][1]).toEqual(darkModeRules[1])
		})

		it('should generate theme rules with alternative mapping', () => {
			const result = themeRules('zinc', { neutral: 'zinc' })
			const zincLight = {
				...lightModeRules[1],
				'--neutral-100': '244 244 245',
				'--neutral-200': '228 228 231',
				'--neutral-300': '212 212 216',
				'--neutral-400': '161 161 170',
				'--neutral-50': '250 250 250',
				'--neutral-500': '113 113 122',
				'--neutral-600': '82 82 91',
				'--neutral-700': '63 63 70',
				'--neutral-800': '39 39 42',
				'--neutral-900': '24 24 27',
				'--neutral-950': '0 0 0'
			}
			const zincDark = {
				...darkModeRules[1],
				'--neutral-100': '24 24 27',
				'--neutral-200': '39 39 42',
				'--neutral-300': '63 63 70',
				'--neutral-400': '82 82 91',
				'--neutral-50': '0 0 0',
				'--neutral-500': '113 113 122',
				'--neutral-600': '161 161 170',
				'--neutral-700': '212 212 216',
				'--neutral-800': '228 228 231',
				'--neutral-900': '244 244 245',
				'--neutral-950': '250 250 250'
			}

			expect(result[0][0]).toEqual('zinc-mode-light')
			expect(result[0][1]).toEqual(zincLight)
			expect(result[1][0]).toEqual('zinc-mode-dark')
			expect(result[1][1]).toEqual(zincDark)
		})
	})
})
