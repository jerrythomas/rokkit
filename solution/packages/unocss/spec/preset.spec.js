import { describe, it, expect } from 'vitest'
import { presetRokkit } from '../src/preset.js'

describe('presetRokkit', () => {
	it('should return a valid UnoCSS preset object', () => {
		const preset = presetRokkit()
		expect(preset).toHaveProperty('name', 'rokkit')
		expect(preset).toHaveProperty('presets')
		expect(preset).toHaveProperty('shortcuts')
		expect(preset).toHaveProperty('theme')
		expect(preset).toHaveProperty('extractors')
		expect(preset).toHaveProperty('rules')
	})

	it('should include presetWind3 and presetIcons in nested presets', () => {
		const preset = presetRokkit()
		expect(preset.presets.length).toBeGreaterThanOrEqual(2)
		const names = preset.presets.map((p) => p.name)
		expect(names).toContain('@unocss/preset-wind3')
		expect(names).toContain('@unocss/preset-icons')
	})

	it('should generate icon shortcuts from DEFAULT_ICONS', () => {
		const preset = presetRokkit()
		const iconEntries = preset.shortcuts.filter(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && typeof s[1] === 'string'
		)
		const iconNames = iconEntries.map(([k]) => k)
		expect(iconNames).toContain('accordion-opened')
		expect(iconNames).toContain('checkbox-checked')
	})

	it('should generate skin shortcuts from config skins', () => {
		const preset = presetRokkit({
			skins: {
				vibrant: { primary: 'blue', secondary: 'purple' }
			}
		})
		const skinEntry = preset.shortcuts.find(
			(s) => Array.isArray(s) && s[0] === 'skin-vibrant'
		)
		expect(skinEntry).toBeDefined()
		expect(typeof skinEntry[1]).toBe('object')
	})

	it('should include font families in theme', () => {
		const preset = presetRokkit()
		expect(preset.theme.fontFamily).toHaveProperty('body')
		expect(preset.theme.fontFamily).toHaveProperty('mono')
		expect(preset.theme.fontFamily).toHaveProperty('heading')
	})

	it('should generate color rules in theme.colors', () => {
		const preset = presetRokkit()
		expect(preset.theme.colors).toHaveProperty('primary')
		expect(preset.theme.colors).toHaveProperty('surface')
		expect(preset.theme.colors.primary).toHaveProperty('500')
	})

	it('should respect inline color overrides', () => {
		const preset = presetRokkit({ colors: { surface: 'zinc' } })
		expect(preset.theme.colors).toHaveProperty('surface')
		expect(preset.theme.colors.surface).toHaveProperty('500')
	})

	it('should include safelist with DEFAULT_ICONS and palette colors', () => {
		const preset = presetRokkit()
		expect(preset.safelist).toBeDefined()
		expect(preset.safelist.length).toBeGreaterThan(0)
		expect(preset.safelist).toContain('accordion-opened')
	})

	it('should include svelte extractor', () => {
		const preset = presetRokkit()
		expect(preset.extractors.length).toBeGreaterThan(0)
	})

	it('should include transformers', () => {
		const preset = presetRokkit()
		expect(preset.transformers.length).toBe(2)
	})

	it('should include the hidden rule', () => {
		const preset = presetRokkit()
		const hiddenRule = preset.rules.find((r) => r[0] === 'hidden')
		expect(hiddenRule).toBeDefined()
		expect(hiddenRule[1]).toEqual({ display: 'none' })
	})
})
