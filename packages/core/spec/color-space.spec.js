import { describe, it, expect } from 'vitest'
import { ColorSpace, RgbColorSpace } from '../src/color-space.js'

describe('ColorSpace', () => {
	describe('factory', () => {
		it('should create RgbColorSpace for "rgb"', () => {
			const cs = ColorSpace.create('rgb')
			expect(cs).toBeInstanceOf(RgbColorSpace)
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
					'color-mix(in srgb, var(--color-primary-500) <alpha-value>%, transparent)'
				)
			})
		})
	})
})
