import { describe, it, expect } from 'vitest'
import { ColorSpace, RgbColorSpace, HslColorSpace, OklchColorSpace } from '../src/color-space.js'

describe('ColorSpace', () => {
	describe('factory', () => {
		it('should create RgbColorSpace for "rgb"', () => {
			const cs = ColorSpace.create('rgb')
			expect(cs).toBeInstanceOf(RgbColorSpace)
		})

		it('should create HslColorSpace for "hsl"', () => {
			const cs = ColorSpace.create('hsl')
			expect(cs).toBeInstanceOf(HslColorSpace)
		})

		it('should create OklchColorSpace for "oklch"', () => {
			const cs = ColorSpace.create('oklch')
			expect(cs).toBeInstanceOf(OklchColorSpace)
		})

		it('should throw for unknown space', () => {
			expect(() => ColorSpace.create('cmyk')).toThrow()
		})
	})

	describe('RgbColorSpace', () => {
		const rgb = new RgbColorSpace()

		it('should have correct name', () => {
			expect(rgb.name).toBe('rgb')
		})

		it('should have correct mixSpace', () => {
			expect(rgb.mixSpace).toBe('srgb')
		})

		it('should have correct fn', () => {
			expect(rgb.fn).toBe('rgb')
		})

		describe('fromHex', () => {
			it('should convert hex to bare RGB channels', () => {
				expect(rgb.fromHex('#ff0000')).toBe('255, 0, 0')
			})

			it('should convert hex to bare RGB channels for white', () => {
				expect(rgb.fromHex('#ffffff')).toBe('255, 255, 255')
			})

			it('should convert hex to bare RGB channels for black', () => {
				expect(rgb.fromHex('#000000')).toBe('0, 0, 0')
			})
		})

		describe('wrap', () => {
			it('should wrap hex to rgb()', () => {
				expect(rgb.wrap('#ff0000')).toBe('rgb(255, 0, 0)')
			})

			it('should wrap comma-separated bare channels', () => {
				expect(rgb.wrap('255,0,0')).toBe('rgb(255, 0, 0)')
			})

			it('should wrap space-separated bare channels', () => {
				expect(rgb.wrap('255 0 0')).toBe('rgb(255, 0, 0)')
			})

			it('should pass through already-wrapped rgb()', () => {
				expect(rgb.wrap('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
			})

			it('should return null for null', () => {
				expect(rgb.wrap(null)).toBe(null)
			})

			it('should return undefined for undefined', () => {
				expect(rgb.wrap(undefined)).toBe(undefined)
			})

			it('should pass through named colors', () => {
				expect(rgb.wrap('rebeccapurple')).toBe('rebeccapurple')
			})

			it('should pass through numbers unchanged', () => {
				expect(rgb.wrap(42)).toBe(42)
			})
		})

		describe('themeColor', () => {
			it('should produce color-mix with srgb', () => {
				expect(rgb.themeColor('--color-primary-500')).toBe(
					'color-mix(in srgb, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)'
				)
			})
		})
	})

	describe('HslColorSpace', () => {
		const hsl = new HslColorSpace()

		it('should have correct name', () => {
			expect(hsl.name).toBe('hsl')
		})

		it('should have correct mixSpace', () => {
			expect(hsl.mixSpace).toBe('srgb')
		})

		it('should have correct fn', () => {
			expect(hsl.fn).toBe('hsl')
		})

		describe('fromHex', () => {
			it('should convert hex to bare HSL channels', () => {
				expect(hsl.fromHex('#ff0000')).toBe('0 100% 50%')
			})

			it('should convert hex for white', () => {
				expect(hsl.fromHex('#ffffff')).toBe('0 0% 100%')
			})

			it('should convert hex for black', () => {
				expect(hsl.fromHex('#000000')).toBe('0 0% 0%')
			})
		})

		describe('wrap', () => {
			it('should wrap hex to hsl()', () => {
				expect(hsl.wrap('#ff0000')).toBe('hsl(0 100% 50%)')
			})

			it('should wrap bare channels', () => {
				expect(hsl.wrap('0 100% 50%')).toBe('hsl(0 100% 50%)')
			})

			it('should pass through already-wrapped hsl()', () => {
				expect(hsl.wrap('hsl(0 100% 50%)')).toBe('hsl(0 100% 50%)')
			})

			it('should return null for null', () => {
				expect(hsl.wrap(null)).toBe(null)
			})

			it('should pass through named colors', () => {
				expect(hsl.wrap('rebeccapurple')).toBe('rebeccapurple')
			})

			it('should pass through non-string values', () => {
				expect(hsl.wrap(42)).toBe(42)
			})
		})

		describe('themeColor', () => {
			it('should produce color-mix with srgb', () => {
				expect(hsl.themeColor('--color-primary-500')).toBe(
					'color-mix(in srgb, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)'
				)
			})
		})
	})

	describe('OklchColorSpace', () => {
		const oklch = new OklchColorSpace()

		it('should have correct name', () => {
			expect(oklch.name).toBe('oklch')
		})

		it('should have correct mixSpace', () => {
			expect(oklch.mixSpace).toBe('oklch')
		})

		it('should have correct fn', () => {
			expect(oklch.fn).toBe('oklch')
		})

		describe('fromHex', () => {
			it('should convert hex to bare OKLCH channels', () => {
				const result = oklch.fromHex('#ff0000')
				const [L, C, H] = result.split(' ').map(Number)
				expect(L).toBeCloseTo(0.6279, 3)
				expect(C).toBeCloseTo(0.2576, 3)
				expect(H).toBeCloseTo(29.23, 1)
			})
		})

		describe('wrap', () => {
			it('should wrap hex to oklch()', () => {
				const result = oklch.wrap('#ff0000')
				expect(result).toMatch(/^oklch\(/)
				// Parse out the values
				const inner = result.slice(6, -1) // strip 'oklch(' and ')'
				const [L, C, H] = inner.split(' ').map(Number)
				expect(L).toBeCloseTo(0.6279, 3)
				expect(C).toBeCloseTo(0.2576, 3)
				expect(H).toBeCloseTo(29.23, 1)
			})

			it('should wrap bare channels', () => {
				expect(oklch.wrap('0.63 0.26 29')).toBe('oklch(0.63 0.26 29)')
			})

			it('should pass through already-wrapped oklch()', () => {
				expect(oklch.wrap('oklch(0.63 0.26 29)')).toBe('oklch(0.63 0.26 29)')
			})

			it('should return null for null', () => {
				expect(oklch.wrap(null)).toBe(null)
			})

			it('should pass through named colors', () => {
				expect(oklch.wrap('rebeccapurple')).toBe('rebeccapurple')
			})

			it('should pass through non-string values', () => {
				expect(oklch.wrap(42)).toBe(42)
			})
		})

		describe('themeColor', () => {
			it('should produce color-mix with oklch', () => {
				expect(oklch.themeColor('--color-primary-500')).toBe(
					'color-mix(in oklch, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)'
				)
			})
		})
	})
})
