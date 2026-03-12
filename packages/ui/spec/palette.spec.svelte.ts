import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	hexToRgb,
	rgbToHex,
	rgbToHsl,
	hslToRgb,
	hexToHsl,
	hslToHex,
	generateShades,
	isHexColor,
	getShades,
	applyPalette,
	resetPalette,
	getTailwindColorNames,
	tailwindColors
} from '../src/utils/palette.js'
import type { RGB, HSL, ShadeKey } from '../src/utils/palette.js'

describe('Palette Utilities', () => {
	// ─── hexToRgb ───────────────────────────────────────────────────

	describe('hexToRgb', () => {
		it('converts black', () => {
			expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
		})

		it('converts white', () => {
			expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
		})

		it('converts a color', () => {
			expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 })
		})

		it('works without leading #', () => {
			expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
		})

		it('is case-insensitive', () => {
			expect(hexToRgb('#FF00FF')).toEqual({ r: 255, g: 0, b: 255 })
		})

		it('throws for invalid hex', () => {
			expect(() => hexToRgb('invalid')).toThrow('Invalid hex color')
		})
	})

	// ─── rgbToHex ───────────────────────────────────────────────────

	describe('rgbToHex', () => {
		it('converts black', () => {
			expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
		})

		it('converts white', () => {
			expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
		})

		it('converts a color', () => {
			expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe('#3b82f6')
		})

		it('clamps values above 255', () => {
			expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe('#ff0000')
		})

		it('clamps values below 0', () => {
			expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe('#000000')
		})

		it('pads single digit hex values', () => {
			expect(rgbToHex({ r: 0, g: 5, b: 0 })).toBe('#000500')
		})
	})

	// ─── hex round-trip ─────────────────────────────────────────────

	describe('hex ↔ RGB round-trip', () => {
		it('round-trips through hex → RGB → hex', () => {
			const hex = '#3b82f6'
			expect(rgbToHex(hexToRgb(hex))).toBe(hex)
		})

		it('round-trips through RGB → hex → RGB', () => {
			const rgb: RGB = { r: 100, g: 200, b: 50 }
			expect(hexToRgb(rgbToHex(rgb))).toEqual(rgb)
		})
	})

	// ─── rgbToHsl ───────────────────────────────────────────────────

	describe('rgbToHsl', () => {
		it('converts black', () => {
			const hsl = rgbToHsl({ r: 0, g: 0, b: 0 })
			expect(hsl.h).toBe(0)
			expect(hsl.s).toBe(0)
			expect(hsl.l).toBe(0)
		})

		it('converts white', () => {
			const hsl = rgbToHsl({ r: 255, g: 255, b: 255 })
			expect(hsl.h).toBe(0)
			expect(hsl.s).toBe(0)
			expect(hsl.l).toBe(100)
		})

		it('converts pure red', () => {
			const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
			expect(hsl.h).toBe(0)
			expect(hsl.s).toBe(100)
			expect(hsl.l).toBe(50)
		})

		it('converts pure green', () => {
			const hsl = rgbToHsl({ r: 0, g: 255, b: 0 })
			expect(hsl.h).toBe(120)
			expect(hsl.s).toBe(100)
			expect(hsl.l).toBe(50)
		})

		it('converts pure blue', () => {
			const hsl = rgbToHsl({ r: 0, g: 0, b: 255 })
			expect(hsl.h).toBe(240)
			expect(hsl.s).toBe(100)
			expect(hsl.l).toBe(50)
		})

		it('converts gray (achromatic)', () => {
			const hsl = rgbToHsl({ r: 128, g: 128, b: 128 })
			expect(hsl.h).toBe(0)
			expect(hsl.s).toBe(0)
			expect(Math.round(hsl.l)).toBeCloseTo(50, 0)
		})
	})

	// ─── hslToRgb ───────────────────────────────────────────────────

	describe('hslToRgb', () => {
		it('converts black', () => {
			expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 })
		})

		it('converts white', () => {
			expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 })
		})

		it('converts pure red', () => {
			expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
		})

		it('converts achromatic (gray)', () => {
			const rgb = hslToRgb({ h: 0, s: 0, l: 50 })
			expect(rgb.r).toBe(rgb.g)
			expect(rgb.g).toBe(rgb.b)
			expect(rgb.r).toBe(128)
		})
	})

	// ─── HSL round-trip ─────────────────────────────────────────────

	describe('hex ↔ HSL round-trip', () => {
		it('round-trips through hex → HSL → hex for primary colors', () => {
			const colors = ['#ff0000', '#00ff00', '#0000ff']
			for (const hex of colors) {
				expect(hslToHex(hexToHsl(hex))).toBe(hex)
			}
		})
	})

	// ─── isHexColor ─────────────────────────────────────────────────

	describe('isHexColor', () => {
		it('accepts 6-digit hex with #', () => {
			expect(isHexColor('#ff0000')).toBe(true)
		})

		it('accepts 3-digit hex with #', () => {
			expect(isHexColor('#f00')).toBe(true)
		})

		it('is case-insensitive', () => {
			expect(isHexColor('#FF00AA')).toBe(true)
		})

		it('rejects hex without #', () => {
			expect(isHexColor('ff0000')).toBe(false)
		})

		it('rejects invalid characters', () => {
			expect(isHexColor('#gggggg')).toBe(false)
		})

		it('rejects empty string', () => {
			expect(isHexColor('')).toBe(false)
		})

		it('rejects color names', () => {
			expect(isHexColor('red')).toBe(false)
		})
	})

	// ─── generateShades ─────────────────────────────────────────────

	describe('generateShades', () => {
		it('returns all 11 shade keys', () => {
			const shades = generateShades('#3b82f6')
			const keys = Object.keys(shades)
			expect(keys).toEqual([
				'50',
				'100',
				'200',
				'300',
				'400',
				'500',
				'600',
				'700',
				'800',
				'900',
				'950'
			])
		})

		it('all shade values are valid hex colors', () => {
			const shades = generateShades('#3b82f6')
			for (const value of Object.values(shades)) {
				expect(isHexColor(value)).toBe(true)
			}
		})

		it('lighter shades (50-400) have higher lightness than 500', () => {
			const shades = generateShades('#3b82f6')
			const base = hexToHsl(shades['500'])
			for (const key of ['50', '100', '200', '300', '400'] as ShadeKey[]) {
				const shade = hexToHsl(shades[key])
				expect(shade.l).toBeGreaterThan(base.l)
			}
		})

		it('darker shades (600-950) have lower lightness than 500', () => {
			const shades = generateShades('#3b82f6')
			const base = hexToHsl(shades['500'])
			for (const key of ['600', '700', '800', '900', '950'] as ShadeKey[]) {
				const shade = hexToHsl(shades[key])
				expect(shade.l).toBeLessThan(base.l)
			}
		})

		it('preserves the hue across all shades', () => {
			const hex = '#3b82f6'
			const baseHue = hexToHsl(hex).h
			const shades = generateShades(hex)
			for (const value of Object.values(shades)) {
				const hsl = hexToHsl(value)
				// Allow small floating-point tolerance
				if (hsl.s > 0) {
					expect(Math.abs(hsl.h - baseHue)).toBeLessThan(1)
				}
			}
		})
	})

	// ─── getShades ──────────────────────────────────────────────────

	describe('getShades', () => {
		it('returns tailwind preset for named colors', () => {
			const shades = getShades('blue')
			expect(shades).toEqual(tailwindColors.blue)
		})

		it('generates shades for hex colors', () => {
			const shades = getShades('#ff6600')
			expect(Object.keys(shades)).toHaveLength(11)
			expect(isHexColor(shades['500'])).toBe(true)
		})

		it('is case-insensitive for color names', () => {
			expect(getShades('Blue')).toEqual(tailwindColors.blue)
		})

		it('throws for unknown color names', () => {
			expect(() => getShades('unicorn')).toThrow('Unknown color')
		})
	})

	// ─── getTailwindColorNames ──────────────────────────────────────

	describe('getTailwindColorNames', () => {
		it('returns an array of strings', () => {
			const names = getTailwindColorNames()
			expect(Array.isArray(names)).toBe(true)
			expect(names.length).toBeGreaterThan(0)
			for (const name of names) {
				expect(typeof name).toBe('string')
			}
		})

		it('includes common colors', () => {
			const names = getTailwindColorNames()
			expect(names).toContain('red')
			expect(names).toContain('blue')
			expect(names).toContain('green')
			expect(names).toContain('slate')
			expect(names).toContain('purple')
		})
	})

	// ─── applyPalette / resetPalette ────────────────────────────────

	describe('applyPalette and resetPalette', () => {
		let element: HTMLDivElement

		beforeEach(() => {
			element = document.createElement('div')
			document.body.appendChild(element)
		})

		afterEach(() => {
			element.remove()
		})

		it('sets CSS variables for a single role', () => {
			applyPalette({ primary: 'blue' }, element)
			// Check that the base variable is set
			const baseVar = element.style.getPropertyValue('--color-primary')
			expect(baseVar).toBeTruthy()
			// Check a shade variable
			const shade500 = element.style.getPropertyValue('--color-primary-500')
			expect(shade500).toBeTruthy()
		})

		it('sets CSS variables for multiple roles', () => {
			applyPalette({ primary: 'blue', accent: 'red' }, element)
			expect(element.style.getPropertyValue('--color-primary')).toBeTruthy()
			expect(element.style.getPropertyValue('--color-accent')).toBeTruthy()
		})

		it('sets all 11 shade variables per role', () => {
			applyPalette({ primary: '#3b82f6' }, element)
			const shadeKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
			for (const shade of shadeKeys) {
				expect(element.style.getPropertyValue(`--color-primary-${shade}`)).toBeTruthy()
			}
		})

		it('stores RGB values as comma-separated numbers', () => {
			applyPalette({ primary: 'blue' }, element)
			const value = element.style.getPropertyValue('--color-primary-500')
			// Should be like "59,130,246"
			expect(value).toMatch(/^\d+,\d+,\d+$/)
		})

		it('skips empty color values', () => {
			applyPalette({ primary: '' }, element)
			expect(element.style.getPropertyValue('--color-primary')).toBe('')
		})

		it('resetPalette removes all CSS variables', () => {
			applyPalette({ primary: 'blue', accent: 'red' }, element)
			resetPalette(['primary', 'accent'], element)
			expect(element.style.getPropertyValue('--color-primary')).toBe('')
			expect(element.style.getPropertyValue('--color-primary-500')).toBe('')
			expect(element.style.getPropertyValue('--color-accent')).toBe('')
		})
	})
})
