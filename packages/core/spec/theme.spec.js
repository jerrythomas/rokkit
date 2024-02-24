import { describe, it, expect } from 'vitest'
import { shadesOf, stateColors, themeColors, contrastColors, themeRules } from '../src/theme'
import contrast from './fixtures/contrast.json'
describe('theme', () => {
	const palettes = ['primary', 'secondary', 'other']

	describe('shadesOf', () => {
		it.each(palettes)('should generate shades without a modifier', (name) => {
			const result = shadesOf(name)
			expect(result).toEqual({
				50: `var(--${name}-50)`,
				100: `var(--${name}-100)`,
				200: `var(--${name}-200)`,
				300: `var(--${name}-300)`,
				400: `var(--${name}-400)`,
				500: `var(--${name}-500)`,
				600: `var(--${name}-600)`,
				700: `var(--${name}-700)`,
				800: `var(--${name}-800)`,
				900: `var(--${name}-900)`,
				950: `var(--${name}-950)`,
				DEFAULT: `var(--${name}-500)`,
				base: `var(--${name}-200)`,
				contrast: `var(--${name}-800)`,
				elevated: `var(--${name}-600)`,
				floating: `var(--${name}-700)`,
				inset: `var(--${name}-100)`,
				muted: `var(--${name}-400)`,
				raised: `var(--${name}-500)`,
				subtle: `var(--${name}-300)`,
				sunken: `var(--${name}-50)`
			})
		})

		it.each(palettes)('should generate shades using hsl modifier', (name) => {
			const result = shadesOf(name, 'hsl')
			expect(result).toEqual({
				50: `hsl(var(--${name}-50))`,
				100: `hsl(var(--${name}-100))`,
				200: `hsl(var(--${name}-200))`,
				300: `hsl(var(--${name}-300))`,
				400: `hsl(var(--${name}-400))`,
				500: `hsl(var(--${name}-500))`,
				600: `hsl(var(--${name}-600))`,
				700: `hsl(var(--${name}-700))`,
				800: `hsl(var(--${name}-800))`,
				900: `hsl(var(--${name}-900))`,
				950: `hsl(var(--${name}-950))`,
				DEFAULT: `hsl(var(--${name}-500))`,
				base: `hsl(var(--${name}-200))`,
				contrast: `hsl(var(--${name}-800))`,
				elevated: `hsl(var(--${name}-600))`,
				floating: `hsl(var(--${name}-700))`,
				inset: `hsl(var(--${name}-100))`,
				muted: `hsl(var(--${name}-400))`,
				raised: `hsl(var(--${name}-500))`,
				subtle: `hsl(var(--${name}-300))`,
				sunken: `hsl(var(--${name}-50))`
			})
		})
		it.each(palettes)('should generate shades using rgb modifier', (name) => {
			const result = shadesOf(name, 'rgb')
			expect(result).toEqual({
				50: `rgb(var(--${name}-50))`,
				100: `rgb(var(--${name}-100))`,
				200: `rgb(var(--${name}-200))`,
				300: `rgb(var(--${name}-300))`,
				400: `rgb(var(--${name}-400))`,
				500: `rgb(var(--${name}-500))`,
				600: `rgb(var(--${name}-600))`,
				700: `rgb(var(--${name}-700))`,
				800: `rgb(var(--${name}-800))`,
				900: `rgb(var(--${name}-900))`,
				950: `rgb(var(--${name}-950))`,
				DEFAULT: `rgb(var(--${name}-500))`,
				base: `rgb(var(--${name}-200))`,
				contrast: `rgb(var(--${name}-800))`,
				elevated: `rgb(var(--${name}-600))`,
				floating: `rgb(var(--${name}-700))`,
				inset: `rgb(var(--${name}-100))`,
				muted: `rgb(var(--${name}-400))`,
				raised: `rgb(var(--${name}-500))`,
				subtle: `rgb(var(--${name}-300))`,
				sunken: `rgb(var(--${name}-50))`
			})
		})
		it.each(palettes)('should generate shades with invalid modifier', (name) => {
			const result = shadesOf(name, 'invalid')
			expect(result).toEqual({
				50: `var(--${name}-50)`,
				100: `var(--${name}-100)`,
				200: `var(--${name}-200)`,
				300: `var(--${name}-300)`,
				400: `var(--${name}-400)`,
				500: `var(--${name}-500)`,
				600: `var(--${name}-600)`,
				700: `var(--${name}-700)`,
				800: `var(--${name}-800)`,
				900: `var(--${name}-900)`,
				950: `var(--${name}-950)`,
				DEFAULT: `var(--${name}-500)`,
				base: `var(--${name}-200)`,
				contrast: `var(--${name}-800)`,
				elevated: `var(--${name}-600)`,
				floating: `var(--${name}-700)`,
				inset: `var(--${name}-100)`,
				muted: `var(--${name}-400)`,
				raised: `var(--${name}-500)`,
				subtle: `var(--${name}-300)`,
				sunken: `var(--${name}-50)`
			})
		})
	})

	describe('stateColors', () => {
		it.each(['info', 'error', 'warn', 'pass'])(
			'should generate shades for states using names',
			(name) => {
				const result = stateColors(name, 'hsl')
				expect(result).toEqual({
					DEFAULT: `hsl(var(--${name}-500))`,
					light: `hsl(var(--${name}-200))`,
					dark: `hsl(var(--${name}-700))`
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
					base: 'hsl(var(--neutral-200))',
					contrast: 'hsl(var(--neutral-800))',
					zebra: 'hsl(var(--neutral-zebra))'
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
					base: 'var(--neutral-200)',
					contrast: 'var(--neutral-800)',
					zebra: 'var(--neutral-zebra)'
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
				'--accent-100': '#e0f2fe',
				'--accent-200': '#bae6fd',
				'--accent-300': '#7dd3fc',
				'--accent-400': '#38bdf8',
				'--accent-50': '#f0f9ff',
				'--accent-500': '#0ea5e9',
				'--accent-600': '#0284c7',
				'--accent-700': '#0369a1',
				'--accent-800': '#075985',
				'--accent-900': '#0c4a6e',
				'--accent-950': '#082f49',
				'--danger-100': '#fee2e2',
				'--danger-200': '#fecaca',
				'--danger-300': '#fca5a5',
				'--danger-400': '#f87171',
				'--danger-50': '#fef2f2',
				'--danger-500': '#ef4444',
				'--danger-600': '#dc2626',
				'--danger-700': '#b91c1c',
				'--danger-800': '#991b1b',
				'--danger-900': '#7f1d1d',
				'--danger-950': '#450a0a',
				'--error-100': '#fee2e2',
				'--error-200': '#fecaca',
				'--error-300': '#fca5a5',
				'--error-400': '#f87171',
				'--error-50': '#fef2f2',
				'--error-500': '#ef4444',
				'--error-600': '#dc2626',
				'--error-700': '#b91c1c',
				'--error-800': '#991b1b',
				'--error-900': '#7f1d1d',
				'--error-950': '#450a0a',
				'--info-100': '#cffafe',
				'--info-200': '#a5f3fc',
				'--info-300': '#67e8f9',
				'--info-400': '#22d3ee',
				'--info-50': '#ecfeff',
				'--info-500': '#06b6d4',
				'--info-600': '#0891b2',
				'--info-700': '#0e7490',
				'--info-800': '#155e75',
				'--info-900': '#164e63',
				'--info-950': '#083344',
				'--neutral-100': '#f1f5f9',
				'--neutral-200': '#e2e8f0',
				'--neutral-300': '#cbd5e0',
				'--neutral-400': '#94a3b8',
				'--neutral-50': '#f8fafc',
				'--neutral-500': '#64748b',
				'--neutral-600': '#475569',
				'--neutral-700': '#334155',
				'--neutral-800': '#1e293b',
				'--neutral-900': '#0f172a',
				'--neutral-950': '#020617',
				// '--pass-100': '#dcfce7',
				// '--pass-200': '#bbf7d0',
				// '--pass-300': '#86efac',
				// '--pass-400': '#4ade80',
				// '--pass-50': '#f0fdf4',
				// '--pass-500': '#22c55e',
				// '--pass-600': '#16a34a',
				// '--pass-700': '#15803d',
				// '--pass-800': '#166534',
				// '--pass-900': '#14532d',
				// '--pass-950': '#052e16',
				'--primary-100': '#ffedd5',
				'--primary-200': '#fed7aa',
				'--primary-300': '#fdba74',
				'--primary-400': '#fb923c',
				'--primary-50': '#fff7ed',
				'--primary-500': '#f97316',
				'--primary-600': '#ea580c',
				'--primary-700': '#c2410c',
				'--primary-800': '#9a3412',
				'--primary-900': '#7c2d12',
				'--primary-950': '#431407',
				'--secondary-100': '#fce7f3',
				'--secondary-200': '#fbcfe8',
				'--secondary-300': '#f9a8d4',
				'--secondary-400': '#f472b6',
				'--secondary-50': '#fdf2f8',
				'--secondary-500': '#ec4899',
				'--secondary-600': '#db2777',
				'--secondary-700': '#be185d',
				'--secondary-800': '#9d174d',
				'--secondary-900': '#831843',
				'--secondary-950': '#500724',
				'--success-100': '#dcfce7',
				'--success-200': '#bbf7d0',
				'--success-300': '#86efac',
				'--success-400': '#4ade80',
				'--success-50': '#f0fdf4',
				'--success-500': '#22c55e',
				'--success-600': '#16a34a',
				'--success-700': '#15803d',
				'--success-800': '#166534',
				'--success-900': '#14532d',
				'--success-950': '#052e16',
				'--warning-100': '#fef9c3',
				'--warning-200': '#fef08a',
				'--warning-300': '#fde047',
				'--warning-400': '#facc15',
				'--warning-50': '#fefce8',
				'--warning-500': '#eab308',
				'--warning-600': '#ca8a04',
				'--warning-700': '#a16207',
				'--warning-800': '#854d0e',
				'--warning-900': '#713f12',
				'--warning-950': '#422006',

				'--code-atrule': 'var(--code-string)',
				// '--code-bg': '#f3f4f6',
				'--code-comment': '#969896',
				'--code-cursor': '#24292e',
				'--code-cursor-block': 'rgba(20, 255, 20, 0.5)',
				'--code-fill': '#f3f4f6',
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
				'--accent-100': '#0c4a6e',
				'--accent-200': '#075985',
				'--accent-300': '#0369a1',
				'--accent-400': '#0284c7',
				'--accent-50': '#082f49',
				'--accent-500': '#0ea5e9',
				'--accent-600': '#38bdf8',
				'--accent-700': '#7dd3fc',
				'--accent-800': '#bae6fd',
				'--accent-900': '#e0f2fe',
				'--accent-950': '#f0f9ff',
				'--danger-100': '#7f1d1d',
				'--danger-200': '#991b1b',
				'--danger-300': '#b91c1c',
				'--danger-400': '#dc2626',
				'--danger-50': '#450a0a',
				'--danger-500': '#ef4444',
				'--danger-600': '#f87171',
				'--danger-700': '#fca5a5',
				'--danger-800': '#fecaca',
				'--danger-900': '#fee2e2',
				'--danger-950': '#fef2f2',
				'--error-100': '#7f1d1d',
				'--error-200': '#991b1b',
				'--error-300': '#b91c1c',
				'--error-400': '#dc2626',
				'--error-50': '#450a0a',
				'--error-500': '#ef4444',
				'--error-600': '#f87171',
				'--error-700': '#fca5a5',
				'--error-800': '#fecaca',
				'--error-900': '#fee2e2',
				'--error-950': '#fef2f2',
				'--info-100': '#164e63',
				'--info-200': '#155e75',
				'--info-300': '#0e7490',
				'--info-400': '#0891b2',
				'--info-50': '#083344',
				'--info-500': '#06b6d4',
				'--info-600': '#22d3ee',
				'--info-700': '#67e8f9',
				'--info-800': '#a5f3fc',
				'--info-900': '#cffafe',
				'--info-950': '#ecfeff',
				'--neutral-100': '#0f172a',
				'--neutral-200': '#1e293b',
				'--neutral-300': '#334155',
				'--neutral-400': '#475569',
				'--neutral-50': '#020617',
				'--neutral-500': '#64748b',
				'--neutral-600': '#94a3b8',
				'--neutral-700': '#cbd5e0',
				'--neutral-800': '#e2e8f0',
				'--neutral-900': '#f1f5f9',
				'--neutral-950': '#f8fafc',
				// '--pass-100': '#14532d',
				// '--pass-200': '#166534',
				// '--pass-300': '#15803d',
				// '--pass-400': '#16a34a',
				// '--pass-50': '#052e16',
				// '--pass-500': '#22c55e',
				// '--pass-600': '#4ade80',
				// '--pass-700': '#86efac',
				// '--pass-800': '#bbf7d0',
				// '--pass-900': '#dcfce7',
				// '--pass-950': '#f0fdf4',
				'--primary-100': '#7c2d12',
				'--primary-200': '#9a3412',
				'--primary-300': '#c2410c',
				'--primary-400': '#ea580c',
				'--primary-50': '#431407',
				'--primary-500': '#f97316',
				'--primary-600': '#fb923c',
				'--primary-700': '#fdba74',
				'--primary-800': '#fed7aa',
				'--primary-900': '#ffedd5',
				'--primary-950': '#fff7ed',
				'--secondary-100': '#831843',
				'--secondary-200': '#9d174d',
				'--secondary-300': '#be185d',
				'--secondary-400': '#db2777',
				'--secondary-50': '#500724',
				'--secondary-500': '#ec4899',
				'--secondary-600': '#f472b6',
				'--secondary-700': '#f9a8d4',
				'--secondary-800': '#fbcfe8',
				'--secondary-900': '#fce7f3',
				'--secondary-950': '#fdf2f8',
				'--success-100': '#14532d',
				'--success-200': '#166534',
				'--success-300': '#15803d',
				'--success-400': '#16a34a',
				'--success-50': '#052e16',
				'--success-500': '#22c55e',
				'--success-600': '#4ade80',
				'--success-700': '#86efac',
				'--success-800': '#bbf7d0',
				'--success-900': '#dcfce7',
				'--success-950': '#f0fdf4',
				'--warning-100': '#713f12',
				'--warning-200': '#854d0e',
				'--warning-300': '#a16207',
				'--warning-400': '#ca8a04',
				'--warning-50': '#422006',
				'--warning-500': '#eab308',
				'--warning-600': '#facc15',
				'--warning-700': '#fde047',
				'--warning-800': '#fef08a',
				'--warning-900': '#fef9c3',
				'--warning-950': '#fefce8',
				'--code-atrule': 'var(--code-string)',
				// '--code-bg': '#282c34',
				'--code-comment': '#5c6370',
				'--code-cursor': '#24292e',
				'--code-cursor-block': 'rgba(20, 255, 20, 0.5)',
				'--code-fill': '#282c34',
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
				'--neutral-100': '#f4f4f5',
				'--neutral-200': '#e4e4e7',
				'--neutral-300': '#d4d4d8',
				'--neutral-400': '#a1a1aa',
				'--neutral-50': '#fafafa',
				'--neutral-500': '#71717a',
				'--neutral-600': '#52525b',
				'--neutral-700': '#3f3f46',
				'--neutral-800': '#27272a',
				'--neutral-900': '#18181b',
				'--neutral-950': '#000000'
			}
			const zincDark = {
				...darkModeRules[1],
				'--neutral-100': '#18181b',
				'--neutral-200': '#27272a',
				'--neutral-300': '#3f3f46',
				'--neutral-400': '#52525b',
				'--neutral-50': '#000000',
				'--neutral-500': '#71717a',
				'--neutral-600': '#a1a1aa',
				'--neutral-700': '#d4d4d8',
				'--neutral-800': '#e4e4e7',
				'--neutral-900': '#f4f4f5',
				'--neutral-950': '#fafafa'
			}

			expect(result[0][0]).toEqual('zinc-mode-light')
			expect(result[0][1]).toEqual(zincLight)
			expect(result[1][0]).toEqual('zinc-mode-dark')
			expect(result[1][1]).toEqual(zincDark)
		})
	})
})
