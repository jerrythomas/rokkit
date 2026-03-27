import { describe, it, expect, vi } from 'vitest'
import { resolvePreset, DEFAULT_PRESET, ACCESSIBLE_PRESET } from '../../src/lib/plot/preset.js'

describe('resolvePreset', () => {
	it('returns default preset when no preset specified', () => {
		const preset = resolvePreset(undefined, {})
		expect(preset.colors).toBeDefined()
		expect(preset.colors.length).toBeGreaterThan(0)
		expect(preset.patterns).toBeDefined()
		expect(preset.symbols).toBeDefined()
	})

	it('returns default preset for "default" name', () => {
		const preset = resolvePreset('default', {})
		expect(preset).toEqual(DEFAULT_PRESET)
	})

	it('returns accessible preset for "accessible" name', () => {
		const preset = resolvePreset('accessible', {})
		expect(preset).toEqual(ACCESSIBLE_PRESET)
		expect(preset.colors.length).toBeGreaterThan(0)
	})

	it('resolves named preset from helpers.presets', () => {
		const brand = { colors: ['#ff0000', '#00ff00'], patterns: ['dots'], symbols: ['circle'] }
		const preset = resolvePreset('brand', { presets: { brand } })
		expect(preset.colors).toEqual(['#ff0000', '#00ff00'])
	})

	it('resolves inline preset from helpers.preset', () => {
		const inline = { colors: ['#aabbcc'], patterns: ['waves'], symbols: ['square'] }
		const preset = resolvePreset(undefined, { preset: inline })
		expect(preset.colors).toEqual(['#aabbcc'])
	})

	it('named preset from helpers overrides helpers.preset', () => {
		const named = { colors: ['#111'], patterns: [], symbols: [] }
		const inline = { colors: ['#222'], patterns: [], symbols: [] }
		const preset = resolvePreset('my-theme', { presets: { 'my-theme': named }, preset: inline })
		expect(preset.colors).toEqual(['#111'])
	})

	it('warns and returns default for unknown named preset', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const preset = resolvePreset('nonexistent', {})
		expect(preset).toEqual(DEFAULT_PRESET)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent'))
		warn.mockRestore()
	})

	it('merges partial preset with defaults (missing fields fall back)', () => {
		const partial = { colors: ['#ff0000'] }
		const preset = resolvePreset(undefined, { preset: partial })
		expect(preset.colors).toEqual(['#ff0000'])
		expect(preset.patterns).toEqual(DEFAULT_PRESET.patterns)
		expect(preset.symbols).toEqual(DEFAULT_PRESET.symbols)
	})
})
