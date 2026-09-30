import { describe, it, expect } from 'vitest'
import { getPaletteColor } from '../src/lib/data/skins.js'

describe('getPaletteColor', () => {
	it('is a built-in palette’s 500 shade', () => {
		expect(getPaletteColor('rose')).toMatch(/^#|^oklch|^rgb/)
		expect(getPaletteColor('rose')).not.toBe('#888')
	})
	it('falls back to grey for a keyword colour or an unknown name, never a character of a string', () => {
		// `inherit` / `current` are STRINGS in preset-mini's colour map, not palettes: indexing one
		// by shade must not return a character.
		expect(getPaletteColor('inherit')).toBe('#888')
		expect(getPaletteColor('current')).toBe('#888')
		expect(getPaletteColor('no-such-palette')).toBe('#888')
	})
})
