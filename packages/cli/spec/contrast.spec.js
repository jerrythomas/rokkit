import { describe, it, expect } from 'vitest'
import {
	parseColor,
	oklchToLinearSrgb,
	relativeLuminance,
	contrastRatio,
	checkContrastTokens
} from '../src/contrast.js'

const PALETTES = {
	kami: {
		50: '0.985 0.005 85',
		300: '0.920 0.012 85',
		400: '0.850 0.010 70',
		500: '0.750 0.008 50',
		700: '0.380 0.012 50',
		900: '0.220 0.012 50'
	},
	sumi: {
		50: '0.170 0.010 50',
		300: '0.320 0.012 50',
		400: '0.420 0.010 50',
		500: '0.570 0.010 50',
		700: '0.600 0.010 85',
		900: '0.940 0.008 85'
	}
}

const healthy = {
	palettes: PALETTES,
	skins: { default: { surface: { light: 'kami', dark: 'sumi' }, ink: { light: 'kami', dark: 'sumi' } } },
	overrides: { 'paper-edge': { light: 'kami.400', dark: 'sumi.300' } }
}

describe('parseColor', () => {
	it('parses a palette ref', () => {
		expect(parseColor('kami.50', PALETTES)).toEqual([0.985, 0.005, 85])
	})
	it('parses a bare "L C H" string', () => {
		expect(parseColor('0.22 0.012 50')).toEqual([0.22, 0.012, 50])
	})
	it('parses an oklch() function', () => {
		expect(parseColor('oklch(0.04 0.025 85)')).toEqual([0.04, 0.025, 85])
	})
	it('returns null for a non-string', () => {
		expect(parseColor(null)).toBeNull()
		expect(parseColor(42)).toBeNull()
	})
	it('returns null for an unknown palette ref', () => {
		expect(parseColor('ghost.50', PALETTES)).toBeNull()
	})
	it('returns null for too-few components or NaN', () => {
		expect(parseColor('0.5 0.1')).toBeNull()
		expect(parseColor('foo bar baz')).toBeNull()
	})
})

describe('oklch → luminance → contrast', () => {
	it('clamps out-of-gamut channels to [0,1]', () => {
		const rgb = oklchToLinearSrgb([2, 0.5, 0]) // way out of gamut
		expect(rgb.every((v) => v >= 0 && v <= 1)).toBe(true)
	})
	it('white vs black ≈ 21:1', () => {
		const white = [1, 0, 0]
		const black = [0, 0, 0]
		expect(relativeLuminance(white)).toBeCloseTo(1, 2)
		expect(relativeLuminance(black)).toBeCloseTo(0, 2)
		expect(contrastRatio(white, black)).toBeGreaterThan(20)
	})
	it('is symmetric', () => {
		const a = [0.22, 0.012, 50]
		const b = [0.985, 0.005, 85]
		expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5)
	})
})

describe('checkContrastTokens', () => {
	it('returns [] for null / no palettes / no skin / missing roles', () => {
		expect(checkContrastTokens(null)).toEqual([])
		expect(checkContrastTokens({})).toEqual([])
		expect(checkContrastTokens({ palettes: PALETTES })).toEqual([]) // no skin
		expect(checkContrastTokens({ palettes: PALETTES, skins: { default: { ink: 'kami' } } })).toEqual([]) // no surface
	})

	it('passes a healthy dual-palette config (no findings)', () => {
		expect(checkContrastTokens(healthy)).toEqual([])
	})

	it('flags ink-mute below AA', () => {
		const cfg = {
			...healthy,
			palettes: { ...PALETTES, kami: { ...PALETTES.kami, 700: '0.800 0.012 50' } } // ink-mute too light in light
		}
		const out = checkContrastTokens(cfg)
		expect(out.some((f) => f.id === 'contrast-ink-mute-light')).toBe(true)
		expect(out.every((f) => f.status === 'warn' && f.fixable === false)).toBe(true)
	})

	it('flags an inverted ink ramp', () => {
		// Make ink-soft (500) DARKER (more contrast) than ink-mute (700) in light.
		const cfg = {
			...healthy,
			palettes: { ...PALETTES, kami: { ...PALETTES.kami, 700: '0.800 0.012 50', 500: '0.300 0.008 50' } }
		}
		const out = checkContrastTokens(cfg)
		expect(out.some((f) => f.id === 'contrast-ramp-light')).toBe(true)
	})

	it('flags an invisible paper-edge (near-black etched in dark)', () => {
		const cfg = { ...healthy, overrides: { 'paper-edge': { light: 'kami.400', dark: 'oklch(0.04 0.025 85)' } } }
		const out = checkContrastTokens(cfg)
		expect(out.some((f) => f.id === 'contrast-paper-edge-dark')).toBe(true)
	})

	it('resolves a single-palette (non-dual) skin and skips unparseable paper', () => {
		// surface points at a palette whose shade-50 is a raw hex → parseColor null → mode skipped.
		const cfg = {
			palettes: { mono: { 50: '#ffffff', 300: '0.9 0 0', 500: '0.7 0 0', 700: '0.4 0 0', 900: '0.2 0 0' } },
			skins: { default: { surface: 'mono', ink: 'mono' } }
		}
		expect(checkContrastTokens(cfg)).toEqual([]) // both modes resolve same palette; paper unparseable → skipped
	})

	it('uses the legacy `skin`/`colors` alias when `skins.default` is absent', () => {
		const viaSkin = { palettes: PALETTES, skin: { surface: { light: 'kami', dark: 'sumi' }, ink: { light: 'kami', dark: 'sumi' } } }
		expect(checkContrastTokens(viaSkin)).toEqual([])
	})
})
