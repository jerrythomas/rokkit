import { describe, it, expect } from 'vitest'
import {
	generateConfig,
	generateChartConfig,
	generateUnoConfig,
	generateAppCssImports,
	generateInitScript
} from '../src/init.js'

describe('generateConfig', () => {
	it('should generate default config object', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.colors).toBeDefined()
		expect(config.colors.primary).toBe('orange')
		expect(config.themes).toEqual(['rokkit'])
		expect(config.defaultTheme).toBe('rokkit')
		expect(config.switcher).toBe('manual')
	})

	it('should use explicit defaultTheme when provided', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit', 'frosted'],
			defaultTheme: 'frosted',
			switcher: 'full'
		})
		expect(config.defaultTheme).toBe('frosted')
	})

	it('should fall back to first theme when defaultTheme is not set', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['minimal', 'rokkit'],
			switcher: 'manual'
		})
		expect(config.defaultTheme).toBe('minimal')
	})

	it('should apply vibrant skin preset', () => {
		const config = generateConfig({
			palette: 'vibrant',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.colors.primary).toBe('blue')
		expect(config.colors.secondary).toBe('purple')
	})

	it('should apply custom colors', () => {
		const config = generateConfig({
			palette: 'custom',
			customColors: { primary: 'red', secondary: 'teal' },
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'system'
		})
		expect(config.colors.primary).toBe('red')
		expect(config.colors.secondary).toBe('teal')
		expect(config.switcher).toBe('system')
	})

	it('should include custom icon path when provided', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'custom',
			iconPath: './static/icons/custom.json',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.icons.custom).toBe('./static/icons/custom.json')
	})
})

describe('generateChartConfig', () => {
	it('returns default color set and standard shades', () => {
		const chart = generateChartConfig({ chartColors: 'default', chartShades: 'standard' })
		expect(chart.colors[0]).toBe('blue')
		expect(chart.shades.light.fill).toBe('300')
		expect(chart.shades.light.stroke).toBe('700')
	})

	it('returns warm color set', () => {
		const chart = generateChartConfig({ chartColors: 'warm', chartShades: 'standard' })
		expect(chart.colors[0]).toBe('rose')
	})

	it('returns high contrast shades', () => {
		const chart = generateChartConfig({ chartColors: 'default', chartShades: 'high' })
		expect(chart.shades.light.fill).toBe('200')
		expect(chart.shades.light.stroke).toBe('800')
	})

	it('falls back to defaults for unknown values', () => {
		const chart = generateChartConfig({ chartColors: 'unknown', chartShades: 'unknown' })
		expect(chart.colors[0]).toBe('blue')
		expect(chart.shades.light.fill).toBe('300')
	})
})

describe('generateConfig with chart', () => {
	it('includes chart section when includeChart is true', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual',
			includeChart: true,
			chartColors: 'default',
			chartShades: 'standard'
		})
		expect(config.chart).toBeDefined()
		expect(config.chart.colors[0]).toBe('blue')
		expect(config.chart.shades.light.fill).toBe('300')
	})

	it('omits chart section when includeChart is false', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual',
			includeChart: false
		})
		expect(config.chart).toBeUndefined()
	})
})

describe('generateUnoConfig', () => {
	it('should return valid uno.config.js content string', () => {
		const content = generateUnoConfig()
		expect(content).toContain("import { presetRokkit } from '@rokkit/unocss'")
		expect(content).toContain("import config from './rokkit.config.js'")
		expect(content).toContain('presetRokkit(config)')
		expect(content).toContain('defineConfig')
	})
})

describe('generateAppCssImports', () => {
	it('should include unocss reset and theme imports', () => {
		const lines = generateAppCssImports(['rokkit'])
		expect(lines).toContain("@import '@unocss/reset/tailwind.css';")
		expect(lines).toContain("@import '@rokkit/themes/base.css';")
		expect(lines).toContain("@import '@rokkit/themes/rokkit.css';")
	})

	it('should include multiple theme imports', () => {
		const lines = generateAppCssImports(['rokkit', 'minimal'])
		expect(lines).toContain("@import '@rokkit/themes/rokkit.css';")
		expect(lines).toContain("@import '@rokkit/themes/minimal.css';")
	})
})

describe('generateInitScript', () => {
	it('should return flash-prevention script for manual switcher', () => {
		const script = generateInitScript('manual', 'rokkit-theme')
		expect(script).toContain('localStorage.getItem')
		expect(script).toContain('rokkit-theme')
		expect(script).toContain('dataset.mode')
	})

	it('should return null for system switcher', () => {
		const script = generateInitScript('system')
		expect(script).toBeNull()
	})

	it('should include data-style for full switcher', () => {
		const script = generateInitScript('full', 'rokkit-theme')
		expect(script).toContain('dataset.style')
		expect(script).toContain("|| 'rokkit'")
		expect(script).toContain('dataset.mode')
	})

	it('should use custom defaultStyle for full switcher', () => {
		const script = generateInitScript('full', 'rokkit-theme', 'frosted')
		expect(script).toContain("|| 'frosted'")
	})
})
