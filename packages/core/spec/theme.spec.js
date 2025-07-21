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
		expect(paletteCustom['--color-accent']).toEqual('#38bdf8')
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
			1: 'var(--color-primary-1)',
			100: 'var(--color-primary-100)',
			2: 'var(--color-primary-2)',
			200: 'var(--color-primary-200)',
			3: 'var(--color-primary-3)',
			300: 'var(--color-primary-300)',
			4: 'var(--color-primary-4)',
			400: 'var(--color-primary-400)',
			5: 'var(--color-primary-5)',
			50: 'var(--color-primary-50)',
			500: 'var(--color-primary-500)',
			6: 'var(--color-primary-6)',
			600: 'var(--color-primary-600)',
			7: 'var(--color-primary-7)',
			700: 'var(--color-primary-700)',
			8: 'var(--color-primary-8)',
			800: 'var(--color-primary-800)',
			9: 'var(--color-primary-9)',
			900: 'var(--color-primary-900)',
			950: 'var(--color-primary-950)',
			DEFAULT: 'var(--color-primary)'
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
		'--color-accent': '#38bdf8',
		'--color-accent-100': '#e0f2fe',
		'--color-accent-200': '#bae6fd',
		'--color-accent-300': '#7dd3fc',
		'--color-accent-400': '#38bdf8',
		'--color-accent-50': '#f0f9ff',
		'--color-accent-500': '#0ea5e9',
		'--color-accent-600': '#0284c7',
		'--color-accent-700': '#0369a1',
		'--color-accent-800': '#075985',
		'--color-accent-900': '#0c4a6e',
		'--color-accent-950': '#082f49',
		'--color-danger': '#f87171',
		'--color-danger-100': '#fee2e2',
		'--color-danger-200': '#fecaca',
		'--color-danger-300': '#fca5a5',
		'--color-danger-400': '#f87171',
		'--color-danger-50': '#fef2f2',
		'--color-danger-500': '#ef4444',
		'--color-danger-600': '#dc2626',
		'--color-danger-700': '#b91c1c',
		'--color-danger-800': '#991b1b',
		'--color-danger-900': '#7f1d1d',
		'--color-danger-950': '#450a0a',
		'--color-error': '#f87171',
		'--color-error-100': '#fee2e2',
		'--color-error-200': '#fecaca',
		'--color-error-300': '#fca5a5',
		'--color-error-400': '#f87171',
		'--color-error-50': '#fef2f2',
		'--color-error-500': '#ef4444',
		'--color-error-600': '#dc2626',
		'--color-error-700': '#b91c1c',
		'--color-error-800': '#991b1b',
		'--color-error-900': '#7f1d1d',
		'--color-error-950': '#450a0a',
		'--color-info': '#22d3ee',
		'--color-info-100': '#cffafe',
		'--color-info-200': '#a5f3fc',
		'--color-info-300': '#67e8f9',
		'--color-info-400': '#22d3ee',
		'--color-info-50': '#ecfeff',
		'--color-info-500': '#06b6d4',
		'--color-info-600': '#0891b2',
		'--color-info-700': '#0e7490',
		'--color-info-800': '#155e75',
		'--color-info-900': '#164e63',
		'--color-info-950': '#083344',
		'--color-neutral': '#94a3b8',
		'--color-neutral-100': '#f1f5f9',
		'--color-neutral-200': '#e2e8f0',
		'--color-neutral-300': '#cbd5e1',
		'--color-neutral-400': '#94a3b8',
		'--color-neutral-50': '#f8fafc',
		'--color-neutral-500': '#64748b',
		'--color-neutral-600': '#475569',
		'--color-neutral-700': '#334155',
		'--color-neutral-800': '#1e293b',
		'--color-neutral-900': '#0f172a',
		'--color-neutral-950': '#020617',
		'--color-primary': '#fb923c',
		'--color-primary-100': '#ffedd5',
		'--color-primary-200': '#fed7aa',
		'--color-primary-300': '#fdba74',
		'--color-primary-400': '#fb923c',
		'--color-primary-50': '#fff7ed',
		'--color-primary-500': '#f97316',
		'--color-primary-600': '#ea580c',
		'--color-primary-700': '#c2410c',
		'--color-primary-800': '#9a3412',
		'--color-primary-900': '#7c2d12',
		'--color-primary-950': '#431407',
		'--color-secondary': '#f472b6',
		'--color-secondary-100': '#fce7f3',
		'--color-secondary-200': '#fbcfe8',
		'--color-secondary-300': '#f9a8d4',
		'--color-secondary-400': '#f472b6',
		'--color-secondary-50': '#fdf2f8',
		'--color-secondary-500': '#ec4899',
		'--color-secondary-600': '#db2777',
		'--color-secondary-700': '#be185d',
		'--color-secondary-800': '#9d174d',
		'--color-secondary-900': '#831843',
		'--color-secondary-950': '#500724',
		'--color-success': '#4ade80',
		'--color-success-100': '#dcfce7',
		'--color-success-200': '#bbf7d0',
		'--color-success-300': '#86efac',
		'--color-success-400': '#4ade80',
		'--color-success-50': '#f0fdf4',
		'--color-success-500': '#22c55e',
		'--color-success-600': '#16a34a',
		'--color-success-700': '#15803d',
		'--color-success-800': '#166534',
		'--color-success-900': '#14532d',
		'--color-success-950': '#052e16',
		'--color-warning': '#facc15',
		'--color-warning-100': '#fef9c3',
		'--color-warning-200': '#fef08a',
		'--color-warning-300': '#fde047',
		'--color-warning-400': '#facc15',
		'--color-warning-50': '#fefce8',
		'--color-warning-500': '#eab308',
		'--color-warning-600': '#ca8a04',
		'--color-warning-700': '#a16207',
		'--color-warning-800': '#854d0e',
		'--color-warning-900': '#713f12',
		'--color-warning-950': '#422006'
	}

	it('should generate theme rules', () => {
		const result = themeRules()
		expect(result).toEqual(paletteRules)
	})

	it('should generate theme rules with alternative mapping', () => {
		const result = themeRules({ neutral: 'zinc' })
		const zincLight = {
			...paletteRules,
			'--color-neutral': '#a1a1aa',
			'--color-neutral-100': '#f4f4f5',
			'--color-neutral-200': '#e4e4e7',
			'--color-neutral-300': '#d4d4d8',
			'--color-neutral-400': '#a1a1aa',
			'--color-neutral-50': '#fafafa',
			'--color-neutral-500': '#71717a',
			'--color-neutral-600': '#52525b',
			'--color-neutral-700': '#3f3f46',
			'--color-neutral-800': '#27272a',
			'--color-neutral-900': '#18181b',
			'--color-neutral-950': '#09090b'
		}

		expect(result).toEqual(zincLight)
	})
})

describe('semanticShortcuts', () => {
	it('should generate shortcuts for secondary color', () => {
		const shortcuts = semanticShortcuts('secondary')
		expect(shortcuts.length).toBe(10 * 2 * 8)
		expect(shortcuts[0]).toEqual([/^(.+):bg-secondary-z1$/, expect.any(Function)])
		expect(shortcuts[1]).toEqual(['bg-secondary-z1', 'bg-secondary-50 dark:bg-secondary-950'])
		expect(shortcuts[2]).toEqual([/^(.+):border-secondary-z1$/, expect.any(Function)])
		expect(shortcuts[3]).toEqual([
			'border-secondary-z1',
			'border-secondary-50 dark:border-secondary-950'
		])
		expect(shortcuts[4]).toEqual([/^(.+):text-secondary-z1$/, expect.any(Function)])
		expect(shortcuts[5]).toEqual(['text-secondary-z1', 'text-secondary-50 dark:text-secondary-950'])
	})
})
