import { describe, it, expect } from 'vitest'
import {
	generateConfig,
	generateChartConfig,
	generateUnoConfig,
	generateAppCssImports,
	serializeRokkitConfig,
	generateZenSumiConfig,
	storageKeyFromName
} from '../src/init.js'

describe('generateConfig', () => {
	it('should generate the zen-sumi OKLCH starter', () => {
		const config = generateConfig({
			palette: 'zen-sumi',
			icons: 'rokkit',
			themes: ['rokkit', 'zen-sumi'],
			switcher: 'full'
		})
		expect(config.colorSpace).toBe('oklch')
		expect(config.tokens).toBe('core')
		expect(config.palettes.kami).toBeDefined()
		expect(config.palettes.shu['500']).toBe('0.580 0.150 35')
		expect(config.skin.surface).toEqual({ light: 'kami', dark: 'sumi' })
		expect(config.skin.ink).toEqual({ light: 'kami', dark: 'sumi' })
		expect(config.skin.primary).toBe('shu')
		expect(config.shape.radius).toBe('soft')
		expect(config.colors).toBeUndefined()
	})

	it('should generate default config object', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.skin).toBeDefined()
		expect(config.skin.primary).toBe('orange')
		expect(config.skin.surface).toBe('slate')
		expect(config.skin.ink).toBe('slate')
		expect(config.skin.secondary).toBeUndefined()
		expect(config.colorSpace).toBe('rgb')
		expect(config.tokens).toBe('core')
		expect(config.themes).toEqual(['rokkit'])
		expect(config.defaultTheme).toBe('rokkit')
		expect(config.switcher).toBe('manual')
		expect(config.colors).toBeUndefined()
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
		expect(config.skin.primary).toBe('blue')
		expect(config.skin.accent).toBe('sky')
	})

	it('should apply custom colors', () => {
		const config = generateConfig({
			palette: 'custom',
			customColors: { primary: 'red', surface: 'stone' },
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'system'
		})
		expect(config.skin.primary).toBe('red')
		expect(config.skin.surface).toBe('stone')
		expect(config.skin.ink).toBe('stone')
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

describe('storageKeyFromName', () => {
	it('derives a safe key from a scoped package name', () => {
		expect(storageKeyFromName('@acme/dashboard')).toBe('acme-dashboard')
	})
	it('keeps a simple name as-is', () => {
		expect(storageKeyFromName('my-learn-app')).toBe('my-learn-app')
	})
	it('returns empty string when there is no usable name (no hardcoded default)', () => {
		expect(storageKeyFromName(undefined)).toBe('')
		expect(storageKeyFromName('')).toBe('')
	})
})

describe('generateConfig storageKey', () => {
	it('uses the provided storageKey', () => {
		const config = generateConfig({
			palette: 'default', icons: 'rokkit', themes: ['rokkit'], switcher: 'manual', storageKey: 'my-app'
		})
		expect(config.storageKey).toBe('my-app')
	})
	it('omits storageKey when none is provided (no hardcoded rokkit-theme default)', () => {
		const config = generateConfig({
			palette: 'default', icons: 'rokkit', themes: ['rokkit'], switcher: 'manual'
		})
		expect(config.storageKey).toBeUndefined()
	})
	it('threads storageKey through the zen-sumi starter', () => {
		const config = generateConfig({
			palette: 'zen-sumi', icons: 'rokkit', themes: ['rokkit', 'zen-sumi'], switcher: 'full', storageKey: 'zen-app'
		})
		expect(config.storageKey).toBe('zen-app')
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
		// transformerDirectives lets consumers use @apply in their own CSS (issue #135)
		expect(content).toContain('transformerDirectives')
		expect(content).toContain('transformers: [transformerDirectives()]')
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

// The app.html flash script is now generated by @rokkit/unocss's themeInitScript
// (single source — covered by that package's hooks.spec.js), so the CLI no longer
// has its own generateInitScript to test.

describe('serializeRokkitConfig', () => {
	it('prepends a named-token header and emits parseable JSON for the rgb starter', () => {
		const config = generateConfig({ palette: 'default', icons: 'rokkit', themes: ['rokkit'], switcher: 'manual' })
		const src = serializeRokkitConfig(config)
		expect(src).toContain('named-token vocabulary')
		expect(src).toContain('bg-paper')
		expect(src).toContain('text-on-primary')
		const json = src.slice(src.indexOf('export default') + 'export default'.length).trim().replace(/\n$/, '')
		expect(JSON.parse(json).skin.primary).toBe('orange')
	})

	it('includes a palettes note for the OKLCH starter', () => {
		const src = serializeRokkitConfig(generateZenSumiConfig({}))
		expect(src).toContain('palettes')
		expect(src).toContain('oklch')
	})
})
