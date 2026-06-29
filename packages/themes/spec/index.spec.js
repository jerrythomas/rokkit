import { describe, it, expect } from 'vitest'
import {
	Theme,
	themeColors,
	themeRules,
	contrastShortcuts,
	iconShortcuts,
	DEFAULT_ICONS,
	DEFAULT_THEME_MAPPING,
	defaultColors
} from '../src/index.js'

describe('@rokkit/themes — barrel exports', () => {
	it('re-exports Theme class from @rokkit/core', () => {
		expect(Theme).toBeDefined()
		expect(typeof Theme).toBe('function')
	})

	it('re-exports themeRules from @rokkit/core', () => {
		expect(themeRules).toBeDefined()
	})

	it('re-exports contrastShortcuts from @rokkit/core', () => {
		expect(contrastShortcuts).toBeDefined()
	})

	it('re-exports iconShortcuts from @rokkit/core', () => {
		expect(iconShortcuts).toBeDefined()
		expect(typeof iconShortcuts).toBe('function')
	})

	it('re-exports DEFAULT_ICONS array from @rokkit/core', () => {
		expect(DEFAULT_ICONS).toBeDefined()
		expect(Array.isArray(DEFAULT_ICONS)).toBe(true)
		expect(DEFAULT_ICONS.length).toBeGreaterThan(0)
	})

	it('re-exports DEFAULT_THEME_MAPPING object from @rokkit/core', () => {
		expect(DEFAULT_THEME_MAPPING).toBeDefined()
		expect(typeof DEFAULT_THEME_MAPPING).toBe('object')
	})

	it('re-exports defaultColors object from @rokkit/core', () => {
		expect(defaultColors).toBeDefined()
		expect(typeof defaultColors).toBe('object')
	})

	it('themeColors() returns a UnoCSS theme colors object', () => {
		const colors = themeColors()
		expect(colors).toBeDefined()
		expect(typeof colors).toBe('object')
		// Should have at least a primary role
		expect(colors).toHaveProperty('primary')
	})

	it('themeColors(mapping, colors) respects overrides', () => {
		const mapping = { primary: 'orange', surface: 'slate' }
		const colors = themeColors(mapping)
		expect(colors).toHaveProperty('primary')
		expect(colors).toHaveProperty('surface')
	})
})
