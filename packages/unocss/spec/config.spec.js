import { describe, it, expect } from 'vitest'
import { loadConfig, DEFAULT_CONFIG } from '../src/config.js'

describe('loadConfig', () => {
	it('should return full defaults when called with no arguments', () => {
		const config = loadConfig()
		expect(config.colors).toEqual(DEFAULT_CONFIG.colors)
		expect(config.skins).toEqual({})
		expect(config.themes).toEqual(['rokkit'])
		expect(config.icons).toEqual({ app: '@rokkit/icons/app.json' })
		expect(config.switcher).toBe('manual')
		expect(config.storageKey).toBe('rokkit-theme')
	})

	it('should merge user colors over defaults', () => {
		const config = loadConfig({ colors: { primary: 'blue', surface: 'zinc' } })
		expect(config.colors.primary).toBe('blue')
		expect(config.colors.surface).toBe('zinc')
		expect(config.colors.secondary).toBe('pink')
		expect(config.colors.accent).toBe('sky')
	})

	it('should pass through skins as-is', () => {
		const skins = {
			vibrant: { primary: 'blue', secondary: 'purple' },
			ocean: { primary: 'cyan', surface: 'slate' }
		}
		const config = loadConfig({ skins })
		expect(config.skins).toEqual(skins)
	})

	it('should merge user icons with default app collection', () => {
		const config = loadConfig({ icons: { custom: './icons/custom.json' } })
		expect(config.icons.app).toBe('@rokkit/icons/app.json')
		expect(config.icons.custom).toBe('./icons/custom.json')
	})

	it('should pass through icons.overrides', () => {
		const overrides = { 'folder-open': 'i-phosphor:folder-open', 'node-opened': 'i-app:chevron' }
		const config = loadConfig({ icons: { overrides } })
		expect(config.icons.overrides).toEqual(overrides)
		expect(config.icons.app).toBe('@rokkit/icons/app.json')
	})

	it('should allow overriding the default app icon collection', () => {
		const config = loadConfig({ icons: { app: './my-app-icons.json' } })
		expect(config.icons.app).toBe('./my-app-icons.json')
	})

	it('should accept themes as array of strings', () => {
		const config = loadConfig({ themes: ['rokkit', 'minimal'] })
		expect(config.themes).toEqual(['rokkit', 'minimal'])
	})

	it('should accept switcher values', () => {
		expect(loadConfig({ switcher: 'system' }).switcher).toBe('system')
		expect(loadConfig({ switcher: 'manual' }).switcher).toBe('manual')
		expect(loadConfig({ switcher: 'full' }).switcher).toBe('full')
	})

	it('should accept custom storageKey', () => {
		const config = loadConfig({ storageKey: 'my-theme' })
		expect(config.storageKey).toBe('my-theme')
	})

	it('should ignore unknown fields', () => {
		const config = loadConfig({ unknown: 'value' })
		expect(config).not.toHaveProperty('unknown')
	})
})
