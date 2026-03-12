import { describe, it, expect } from 'vitest'
import {
	generateConfig,
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
		expect(config.switcher).toBe('manual')
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

describe('generateUnoConfig', () => {
	it('should return valid uno.config.js content string', () => {
		const content = generateUnoConfig()
		expect(content).toContain("import { presetRokkit } from '@rokkit/unocss'")
		expect(content).toContain('presetRokkit()')
		expect(content).toContain('defineConfig')
	})
})

describe('generateAppCssImports', () => {
	it('should include unocss reset and theme imports', () => {
		const lines = generateAppCssImports(['rokkit'])
		expect(lines).toContain("@import '@unocss/reset/tailwind.css';")
		expect(lines).toContain("@import '@rokkit/themes/dist/base';")
		expect(lines).toContain("@import '@rokkit/themes/dist/rokkit';")
	})

	it('should include multiple theme imports', () => {
		const lines = generateAppCssImports(['rokkit', 'minimal'])
		expect(lines).toContain("@import '@rokkit/themes/dist/rokkit';")
		expect(lines).toContain("@import '@rokkit/themes/dist/minimal';")
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
		expect(script).toContain('dataset.mode')
	})
})
