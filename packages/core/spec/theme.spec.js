import { describe, it, expect } from 'vitest'
import { shadesOf, themeRules, semanticShortcuts, Theme } from '../src/theme'

const palettes = ['primary', 'secondary', 'other']

describe('Theme class', () => {
	it('should set and get colors using public API only', () => {
		const theme = new Theme()
		const colors = { primary: { 500: 'rgb(1,2,3)' }, secondary: { 500: 'rgb(4,5,6)' } }
		theme.colors = colors
		expect(theme.colors.primary[500]).toBe('rgb(1,2,3)')
		expect(theme.colors.secondary[500]).toBe('rgb(4,5,6)')
	})

	it('should set and get mapping using public API only', () => {
		const theme = new Theme()
		const mapping = { primary: 'red', secondary: 'blue' }
		theme.mapping = mapping
		expect(theme.mapping.primary).toBe('red')
		expect(theme.mapping.secondary).toBe('blue')
	})

	it('should get palette with default and custom mapping', () => {
		const theme = new Theme()
		const paletteDefault = theme.getPalette()
		expect(typeof paletteDefault).toBe('object')
		expect(Object.keys(paletteDefault).length).toBeGreaterThan(0)

		const customMapping = { primary: 'red', secondary: 'blue' }
		const paletteCustom = theme.getPalette(customMapping)
		expect(typeof paletteCustom).toBe('object')
		expect(Object.keys(paletteCustom).length).toBeGreaterThan(0)
		expect(paletteCustom['--color-accent']).toEqual('56,189,248')
	})

	it('should get semantic shortcuts', () => {
		const theme = new Theme()
		const shortcuts = theme.getShortcuts('secondary')
		expect(Array.isArray(shortcuts)).toBe(true)
		expect(shortcuts.length).toBeGreaterThan(0)
	})

	it('should get colors using shadesOf', () => {
		const theme = new Theme()
		const colors = theme.getColorRules()
		expect(colors).toHaveProperty('primary')
		expect(colors.primary).toHaveProperty('500')
		expect(colors).toHaveProperty('secondary')
		expect(colors.secondary).toHaveProperty('500')
		expect(colors.primary).toEqual({
			1: 'rgba(var(--color-primary-1),<alpha-value>)',
			100: 'rgba(var(--color-primary-100),<alpha-value>)',
			2: 'rgba(var(--color-primary-2),<alpha-value>)',
			200: 'rgba(var(--color-primary-200),<alpha-value>)',
			3: 'rgba(var(--color-primary-3),<alpha-value>)',
			300: 'rgba(var(--color-primary-300),<alpha-value>)',
			4: 'rgba(var(--color-primary-4),<alpha-value>)',
			400: 'rgba(var(--color-primary-400),<alpha-value>)',
			5: 'rgba(var(--color-primary-5),<alpha-value>)',
			50: 'rgba(var(--color-primary-50),<alpha-value>)',
			500: 'rgba(var(--color-primary-500),<alpha-value>)',
			6: 'rgba(var(--color-primary-6),<alpha-value>)',
			600: 'rgba(var(--color-primary-600),<alpha-value>)',
			7: 'rgba(var(--color-primary-7),<alpha-value>)',
			700: 'rgba(var(--color-primary-700),<alpha-value>)',
			8: 'rgba(var(--color-primary-8),<alpha-value>)',
			800: 'rgba(var(--color-primary-800),<alpha-value>)',
			9: 'rgba(var(--color-primary-9),<alpha-value>)',
			900: 'rgba(var(--color-primary-900),<alpha-value>)',
			950: 'rgba(var(--color-primary-950),<alpha-value>)',
			DEFAULT: 'rgba(var(--color-primary),<alpha-value>)'
		})
	})
})

describe('shadesOf', () => {
	it.each(palettes)('should generate shades using rgb modifier', (name) => {
		const result = shadesOf(name, 'rgb')
		expect(result).toEqual({
			50: `rgb(var(--color-${name}-50) / <alpha-value>)`,
			100: `rgb(var(--color-${name}-100) / <alpha-value>)`,
			200: `rgb(var(--color-${name}-200) / <alpha-value>)`,
			300: `rgb(var(--color-${name}-300) / <alpha-value>)`,
			400: `rgb(var(--color-${name}-400) / <alpha-value>)`,
			500: `rgb(var(--color-${name}-500) / <alpha-value>)`,
			600: `rgb(var(--color-${name}-600) / <alpha-value>)`,
			700: `rgb(var(--color-${name}-700) / <alpha-value>)`,
			800: `rgb(var(--color-${name}-800) / <alpha-value>)`,
			900: `rgb(var(--color-${name}-900) / <alpha-value>)`,
			950: `rgb(var(--color-${name}-950) / <alpha-value>)`,
			DEFAULT: `rgb(var(--color-${name}-500) / <alpha-value>)`
		})
	})

	it.each(palettes)('should generate shades using hsl modifier', (name) => {
		const result = shadesOf(name, 'hsl')
		expect(result).toEqual({
			50: `hsl(var(--color-${name}-50) / <alpha-value>)`,
			100: `hsl(var(--color-${name}-100) / <alpha-value>)`,
			200: `hsl(var(--color-${name}-200) / <alpha-value>)`,
			300: `hsl(var(--color-${name}-300) / <alpha-value>)`,
			400: `hsl(var(--color-${name}-400) / <alpha-value>)`,
			500: `hsl(var(--color-${name}-500) / <alpha-value>)`,
			600: `hsl(var(--color-${name}-600) / <alpha-value>)`,
			700: `hsl(var(--color-${name}-700) / <alpha-value>)`,
			800: `hsl(var(--color-${name}-800) / <alpha-value>)`,
			900: `hsl(var(--color-${name}-900) / <alpha-value>)`,
			950: `hsl(var(--color-${name}-950) / <alpha-value>)`,
			DEFAULT: `hsl(var(--color-${name}-500) / <alpha-value>)`
		})
	})
	it.each(palettes)('should generate shades using rgb modifier', (name) => {
		const result = shadesOf(name, 'rgb')
		expect(result).toEqual({
			50: `rgb(var(--color-${name}-50) / <alpha-value>)`,
			100: `rgb(var(--color-${name}-100) / <alpha-value>)`,
			200: `rgb(var(--color-${name}-200) / <alpha-value>)`,
			300: `rgb(var(--color-${name}-300) / <alpha-value>)`,
			400: `rgb(var(--color-${name}-400) / <alpha-value>)`,
			500: `rgb(var(--color-${name}-500) / <alpha-value>)`,
			600: `rgb(var(--color-${name}-600) / <alpha-value>)`,
			700: `rgb(var(--color-${name}-700) / <alpha-value>)`,
			800: `rgb(var(--color-${name}-800) / <alpha-value>)`,
			900: `rgb(var(--color-${name}-900) / <alpha-value>)`,
			950: `rgb(var(--color-${name}-950) / <alpha-value>)`,
			DEFAULT: `rgb(var(--color-${name}-500) / <alpha-value>)`
		})
	})
	it.each(palettes)('should generate shades with invalid modifier', (name) => {
		const result = shadesOf(name, 'invalid')
		expect(result).toEqual({
			100: `var(--color-${name}-100)`,
			200: `var(--color-${name}-200)`,
			300: `var(--color-${name}-300)`,
			400: `var(--color-${name}-400)`,
			50: `var(--color-${name}-50)`,
			500: `var(--color-${name}-500)`,
			600: `var(--color-${name}-600)`,
			700: `var(--color-${name}-700)`,
			800: `var(--color-${name}-800)`,
			900: `var(--color-${name}-900)`,
			950: `var(--color-${name}-950)`,
			DEFAULT: `var(--color-${name}-500)`
		})
	})
})

describe('themeRules', () => {
	const paletteRules = {
		'--color-accent': '56,189,248',
		'--color-accent-100': '224,242,254',
		'--color-accent-200': '186,230,253',
		'--color-accent-300': '125,211,252',
		'--color-accent-400': '56,189,248',
		'--color-accent-50': '240,249,255',
		'--color-accent-500': '14,165,233',
		'--color-accent-600': '2,132,199',
		'--color-accent-700': '3,105,161',
		'--color-accent-800': '7,89,133',
		'--color-accent-900': '12,74,110',
		'--color-accent-950': '8,47,73',
		'--color-danger': '248,113,113',
		'--color-danger-100': '254,226,226',
		'--color-danger-200': '254,202,202',
		'--color-danger-300': '252,165,165',
		'--color-danger-400': '248,113,113',
		'--color-danger-50': '254,242,242',
		'--color-danger-500': '239,68,68',
		'--color-danger-600': '220,38,38',
		'--color-danger-700': '185,28,28',
		'--color-danger-800': '153,27,27',
		'--color-danger-900': '127,29,29',
		'--color-danger-950': '69,10,10',
		'--color-error': '248,113,113',
		'--color-error-100': '254,226,226',
		'--color-error-200': '254,202,202',
		'--color-error-300': '252,165,165',
		'--color-error-400': '248,113,113',
		'--color-error-50': '254,242,242',
		'--color-error-500': '239,68,68',
		'--color-error-600': '220,38,38',
		'--color-error-700': '185,28,28',
		'--color-error-800': '153,27,27',
		'--color-error-900': '127,29,29',
		'--color-error-950': '69,10,10',
		'--color-info': '34,211,238',
		'--color-info-100': '207,250,254',
		'--color-info-200': '165,243,252',
		'--color-info-300': '103,232,249',
		'--color-info-400': '34,211,238',
		'--color-info-50': '236,254,255',
		'--color-info-500': '6,182,212',
		'--color-info-600': '8,145,178',
		'--color-info-700': '14,116,144',
		'--color-info-800': '21,94,117',
		'--color-info-900': '22,78,99',
		'--color-info-950': '8,51,68',
		'--color-primary': '251,146,60',
		'--color-primary-100': '255,237,213',
		'--color-primary-200': '254,215,170',
		'--color-primary-300': '253,186,116',
		'--color-primary-400': '251,146,60',
		'--color-primary-50': '255,247,237',
		'--color-primary-500': '249,115,22',
		'--color-primary-600': '234,88,12',
		'--color-primary-700': '194,65,12',
		'--color-primary-800': '154,52,18',
		'--color-primary-900': '124,45,18',
		'--color-primary-950': '67,20,7',
		'--color-secondary': '244,114,182',
		'--color-secondary-100': '252,231,243',
		'--color-secondary-200': '251,207,232',
		'--color-secondary-300': '249,168,212',
		'--color-secondary-400': '244,114,182',
		'--color-secondary-50': '253,242,248',
		'--color-secondary-500': '236,72,153',
		'--color-secondary-600': '219,39,119',
		'--color-secondary-700': '190,24,93',
		'--color-secondary-800': '157,23,77',
		'--color-secondary-900': '131,24,67',
		'--color-secondary-950': '80,7,36',
		'--color-success': '74,222,128',
		'--color-success-100': '220,252,231',
		'--color-success-200': '187,247,208',
		'--color-success-300': '134,239,172',
		'--color-success-400': '74,222,128',
		'--color-success-50': '240,253,244',
		'--color-success-500': '34,197,94',
		'--color-success-600': '22,163,74',
		'--color-success-700': '21,128,61',
		'--color-success-800': '22,101,52',
		'--color-success-900': '20,83,45',
		'--color-success-950': '5,46,22',
		'--color-surface': '148,163,184',
		'--color-surface-100': '241,245,249',
		'--color-surface-200': '226,232,240',
		'--color-surface-300': '203,213,225',
		'--color-surface-400': '148,163,184',
		'--color-surface-50': '248,250,252',
		'--color-surface-500': '100,116,139',
		'--color-surface-600': '71,85,105',
		'--color-surface-700': '51,65,85',
		'--color-surface-800': '30,41,59',
		'--color-surface-900': '15,23,42',
		'--color-surface-950': '2,6,23',
		'--color-warning': '250,204,21',
		'--color-warning-100': '254,249,195',
		'--color-warning-200': '254,240,138',
		'--color-warning-300': '253,224,71',
		'--color-warning-400': '250,204,21',
		'--color-warning-50': '254,252,232',
		'--color-warning-500': '234,179,8',
		'--color-warning-600': '202,138,4',
		'--color-warning-700': '161,98,7',
		'--color-warning-800': '133,77,14',
		'--color-warning-900': '113,63,18',
		'--color-warning-950': '66,32,6'
	}

	it('should generate theme rules', () => {
		const result = themeRules()
		expect(result).toEqual(paletteRules)
	})

	it('should generate theme rules with alternative mapping', () => {
		const result = themeRules({ surface: 'zinc' })
		const zincLight = {
			...paletteRules,
			'--color-surface': '161,161,170',
			'--color-surface-100': '244,244,245',
			'--color-surface-200': '228,228,231',
			'--color-surface-300': '212,212,216',
			'--color-surface-400': '161,161,170',
			'--color-surface-50': '250,250,250',
			'--color-surface-500': '113,113,122',
			'--color-surface-600': '82,82,91',
			'--color-surface-700': '63,63,70',
			'--color-surface-800': '39,39,42',
			'--color-surface-900': '24,24,27',
			'--color-surface-950': '9,9,11'
		}

		expect(result).toEqual(zincLight)
	})
})

describe('semanticShortcuts', () => {
	it('should generate shortcuts for secondary color', () => {
		const shortcuts = semanticShortcuts('secondary')
		expect(shortcuts.length).toBe(11 * 3 * 8)
		expect(shortcuts[0]).toEqual([/^(.+):bg-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[1]).toEqual([/bg-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[2]).toEqual(['bg-secondary-z0', 'bg-secondary-50 dark:bg-secondary-950'])
		expect(shortcuts[3]).toEqual([/^(.+):border-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[4]).toEqual([/border-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[5]).toEqual([
			'border-secondary-z0',
			'border-secondary-50 dark:border-secondary-950'
		])
		expect(shortcuts[6]).toEqual([/^(.+):text-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[7]).toEqual([/text-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[8]).toEqual(['text-secondary-z0', 'text-secondary-50 dark:text-secondary-950'])
	})
})
