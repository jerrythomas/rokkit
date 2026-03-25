import { describe, it, expect } from 'vitest'
import { swatch } from '../../src/lib/swatch'

describe('Swatch Store', () => {
	const { palette, keys } = swatch

	it('should contain a swatch object', () => {
		expect(Object.keys(swatch)).toEqual(['palette', 'keys'])
	})

	describe('patterns', () => {
		it('should contain a set of pattern keys', () => {
			expect(Array.isArray(keys.pattern)).toBe(true)
			expect(keys.pattern.length).toBeGreaterThan(0)
		})
	})

	describe('palette', () => {
		it('should contain a set of palettes', () => {
			expect(Object.keys(palette)).toMatchSnapshot()
			expect(keys.gray).toEqual(['gray'])
		})
	})
})
