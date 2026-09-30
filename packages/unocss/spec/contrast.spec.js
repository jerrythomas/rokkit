import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkInkContrast } from '../src/contrast.js'

afterEach(() => vi.restoreAllMocks())

const palette = (l100, l300, l700, l900) => ({ 100: `${l100} 0.01 90`, 300: `${l300} 0.01 90`, 700: `${l700} 0.01 90`, 900: `${l900} 0.01 90` })

describe('checkInkContrast', () => {
	it('warns for each complementary shade pair closer than 0.3 in lightness', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const config = { palettes: { paper: palette(0.9, 0.8, 0.3, 0.2), ink: palette(0.9, 0.8, 0.7, 0.75) } }
		checkInkContrast(config, { surface: 'paper', ink: 'ink' })
		expect(warn).toHaveBeenCalledTimes(2)
		expect(warn.mock.calls[0][0]).toContain('ink-900 on surface-100')
	})

	it('draws the line at 0.3 — a pair 0.25 apart warns, one 0.35 apart does not', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		// surface-100 0.9 vs ink-900 0.65 → 0.25 (warns); surface-300 0.8 vs ink-700 0.45 → 0.35 (fine)
		const config = { palettes: { paper: palette(0.9, 0.8, 0.3, 0.2), ink: palette(0.9, 0.8, 0.45, 0.65) } }
		checkInkContrast(config, { surface: 'paper', ink: 'ink' })
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('(0.25)')
	})

	it('is silent with enough contrast, a dual-palette light side, or no custom palettes', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const config = { palettes: { paper: palette(0.95, 0.9, 0.3, 0.2), ink: palette(0.9, 0.8, 0.3, 0.1) } }
		checkInkContrast(config, { surface: { light: 'paper', dark: 'x' }, ink: 'ink' })
		checkInkContrast({ palettes: {} }, { surface: 'slate', ink: 'slate' })
		checkInkContrast(config, { surface: 'paper', ink: { alias: 'surface' } })
		expect(warn).not.toHaveBeenCalled()
	})
})
