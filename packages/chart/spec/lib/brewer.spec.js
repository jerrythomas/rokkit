import { describe, it, expect } from 'vitest'
import { swatch } from '../../src/lib/swatch'
import { getFillPatterns } from '../../src/lib/brewer'

describe('brewer', () => {
	const baseSwatch = swatch
	it('should generate a set of patterns for given values', () => {
		const values = ['a', 'b', 'c', 'd']
		const result = getFillPatterns(values, baseSwatch)
		expect(result).toEqual({
			a: { color: 'gold',     pattern: 'diagonal' },
			b: { color: 'lavender', pattern: 'dots' },
			c: { color: 'teal',     pattern: 'triangles' },
			d: { color: 'rose',     pattern: 'hatch' }
		})
	})
})
