import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	hexToRgb,
	rgbToHex,
	rgbToHsl,
	hslToRgb,
	hexToHsl,
	hslToHex,
	hexToOklch,
	oklchToHex,
	rgbToOklch,
	oklchToRgb,
	generateShades,
	isHexColor,
	getShades,
	applyPalette,
	resetPalette,
	savePalette,
	loadPalette,
	getTailwindColorNames,
	tailwindColors
} from '../src/utils/palette.js'
import type { RGB, HSL, OKLCH, ShadeKey } from '../src/utils/palette.js'

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

		it('converts pure green (max === g branch in computeHue)', () => {
			const hsl = rgbToHsl({ r: 0, g: 255, b: 0 })
			expect(hsl.h).toBe(120)
			expect(hsl.s).toBe(100)
			expect(hsl.l).toBe(50)
		})

		it('converts pure blue (fallback branch in computeHue)', () => {
			const hsl = rgbToHsl({ r: 0, g: 0, b: 255 })
			expect(hsl.h).toBe(240)
			expect(hsl.s).toBe(100)
			expect(hsl.l).toBe(50)
		})

		it('converts magenta (max === r, g < b → adds 6 in computeHue)', () => {
			// r=255, g=50, b=200: max===r, g<b → ((g-b)/d + 6) / 6 path
			const hsl = rgbToHsl({ r: 255, g: 50, b: 200 })
			expect(hsl.s).toBeGreaterThan(0)
			// Hue should be in the ~300–360 range (magenta/rose)
			expect(hsl.h).toBeGreaterThan(290)
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

		it('applies palette with hsl color space', () => {
			applyPalette({ primary: 'blue' }, element, 'hsl')
			const value = element.style.getPropertyValue('--color-primary-500')
			// HSL format: "219 71% 61%" (numbers with % signs)
			expect(value).toMatch(/^\d+ \d+% \d+%$/)
		})

		it('applies palette with oklch color space', () => {
			applyPalette({ primary: 'blue' }, element, 'oklch')
			const value = element.style.getPropertyValue('--color-primary-500')
			// OKLCH format: "0.6231 0.1888 259.97" (three numbers)
			expect(value).toMatch(/^[\d.]+ [\d.]+ [\d.]+$/)
		})

		it('resetPalette removes all CSS variables', () => {
			applyPalette({ primary: 'blue', accent: 'red' }, element)
			resetPalette(['primary', 'accent'], element)
			expect(element.style.getPropertyValue('--color-primary')).toBe('')
			expect(element.style.getPropertyValue('--color-primary-500')).toBe('')
			expect(element.style.getPropertyValue('--color-accent')).toBe('')
		})

		it('resetPalette uses default roles when called with no arguments', () => {
			// Apply to documentElement to test the default
			applyPalette({ primary: 'blue' }, document.documentElement)
			resetPalette() // uses default roles and document.documentElement
			expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('')
			expect(document.documentElement.style.getPropertyValue('--color-primary-500')).toBe('')
		})
	})

	// ─── OKLCH conversions ──────────────────────────────────────────

	describe('OKLCH conversions', () => {
		it('rgbToOklch returns object with L, C, H', () => {
			const oklch = rgbToOklch({ r: 59, g: 130, b: 246 })
			expect(oklch).toHaveProperty('L')
			expect(oklch).toHaveProperty('C')
			expect(oklch).toHaveProperty('H')
			expect(oklch.L).toBeGreaterThan(0)
			expect(oklch.L).toBeLessThanOrEqual(1)
			expect(oklch.C).toBeGreaterThanOrEqual(0)
			expect(oklch.H).toBeGreaterThanOrEqual(0)
			expect(oklch.H).toBeLessThan(360)
		})

		it('rgbToOklch handles black correctly', () => {
			const oklch = rgbToOklch({ r: 0, g: 0, b: 0 })
			expect(oklch.L).toBeCloseTo(0, 2)
			expect(oklch.C).toBeCloseTo(0, 2)
		})

		it('rgbToOklch handles white correctly', () => {
			const oklch = rgbToOklch({ r: 255, g: 255, b: 255 })
			expect(oklch.L).toBeCloseTo(1, 2)
			expect(oklch.C).toBeCloseTo(0, 2)
		})

		it('oklchToRgb converts OKLCH back to approx RGB', () => {
			const rgb = oklchToRgb({ L: 0.6231, C: 0.1888, H: 260 })
			expect(typeof rgb.r).toBe('number')
			expect(typeof rgb.g).toBe('number')
			expect(typeof rgb.b).toBe('number')
			expect(rgb.r).toBeGreaterThanOrEqual(0)
			expect(rgb.r).toBeLessThanOrEqual(255)
		})

		it('oklchToRgb clamps very dark (near-black) values via linearToSrgb low branch', () => {
			// linearToSrgb: s <= 0.0031308 → s * 12.92  (the low-value branch)
			// A very dark OKLCH color produces near-zero linear components
			const rgb = oklchToRgb({ L: 0.001, C: 0, H: 0 })
			expect(rgb.r).toBeGreaterThanOrEqual(0)
			expect(rgb.r).toBeLessThanOrEqual(5)
		})

		it('hexToOklch → oklchToHex round-trip', () => {
			const hex = '#3b82f6'
			const oklch = hexToOklch(hex)
			const roundTrip = oklchToHex(oklch)
			// Round-trip should be very close (within 1 color step per channel)
			const orig = hexToRgb(hex)
			const result = hexToRgb(roundTrip)
			expect(Math.abs(orig.r - result.r)).toBeLessThanOrEqual(2)
			expect(Math.abs(orig.g - result.g)).toBeLessThanOrEqual(2)
			expect(Math.abs(orig.b - result.b)).toBeLessThanOrEqual(2)
		})

		it('hue angle is non-negative for colors with negative atan2', () => {
			// Colors with b < 0 in OKLAB space have negative raw atan2 → H += 360
			// Pure blue tends to have negative b component
			const oklch = rgbToOklch({ r: 0, g: 0, b: 255 })
			expect(oklch.H).toBeGreaterThanOrEqual(0)
		})
	})

	// ─── hslToRgb full branch coverage ──────────────────────────────

	describe('hslToRgb branch coverage', () => {
		it('covers q branch when l >= 0.5 (high-lightness colors)', () => {
			// l > 0.5 uses: q = l + s - l*s
			const rgb = hslToRgb({ h: 120, s: 100, l: 75 })
			expect(rgb.r).toBeGreaterThanOrEqual(0)
			expect(rgb.g).toBeGreaterThanOrEqual(0)
			expect(rgb.b).toBeGreaterThanOrEqual(0)
		})

		it('covers hue2rgb tt < 1/6 branch (red hue component)', () => {
			// hue sector where hue+1/3 wraps into <1/6 range
			const rgb = hslToRgb({ h: 30, s: 100, l: 50 })
			expect(rgb.r).toBeGreaterThan(0)
		})

		it('covers hue2rgb 1/2 <= tt < 2/3 branch', () => {
			// Hue sector causing p + (q - p) * (2/3 - tt) * 6
			const rgb = hslToRgb({ h: 210, s: 100, l: 50 })
			expect(rgb.b).toBeGreaterThan(0)
		})

		it('covers normalizeT t < 0 branch', () => {
			// hue2rgb is called with h-1/3 where h is near 0 → t goes negative
			// Pure red hue=0: h-1/3 = -1/3 → normalizeT adds 1
			const rgb = hslToRgb({ h: 0, s: 100, l: 50 })
			expect(rgb).toEqual({ r: 255, g: 0, b: 0 })
		})

		it('covers normalizeT t > 1 branch', () => {
			// hue+1/3 > 1 → normalizeT subtracts 1
			// Hue near 360 pushes h+1/3 > 1
			const rgb = hslToRgb({ h: 330, s: 100, l: 50 })
			expect(rgb.r).toBeGreaterThan(0)
		})
	})

	// ─── savePalette / loadPalette ──────────────────────────────────

	describe('savePalette and loadPalette', () => {
		// Node / JSDOM may expose a broken native localStorage — install a
		// working in-memory mock for the duration of this describe block.
		const storage = new Map<string, string>()
		const localStorageMock = {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, value),
			removeItem: (key: string) => storage.delete(key),
			clear: () => storage.clear(),
			get length() {
				return storage.size
			},
			key: (index: number) => [...storage.keys()][index] ?? null
		}

		beforeEach(() => {
			storage.clear()
			Object.defineProperty(globalThis, 'localStorage', {
				value: localStorageMock,
				writable: true,
				configurable: true
			})
		})

		afterEach(() => {
			storage.clear()
		})

		it('saves and loads palette round-trip', () => {
			const mapping = { primary: 'blue', accent: '#ff6600' }
			savePalette('test-key', mapping)
			const loaded = loadPalette('test-key')
			expect(loaded).toEqual(mapping)
		})

		it('loadPalette returns null for missing key', () => {
			const loaded = loadPalette('nonexistent-key')
			expect(loaded).toBeNull()
		})

		it('loadPalette returns null for malformed JSON', () => {
			localStorageMock.setItem('bad-palette', '{not valid json}')
			const loaded = loadPalette('bad-palette')
			expect(loaded).toBeNull()
		})

		it('savePalette is a no-op when localStorage is undefined', () => {
			// Simulate SSR: set localStorage to undefined
			Object.defineProperty(globalThis, 'localStorage', {
				value: undefined,
				writable: true,
				configurable: true
			})
			expect(() => savePalette('key', { primary: 'blue' })).not.toThrow()
		})

		it('loadPalette returns null when localStorage is undefined', () => {
			Object.defineProperty(globalThis, 'localStorage', {
				value: undefined,
				writable: true,
				configurable: true
			})
			const result = loadPalette('key')
			expect(result).toBeNull()
		})
	})
})
