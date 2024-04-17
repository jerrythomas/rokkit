import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { swatch } from '../../src/lib/swatch'
import { getFillPatterns } from '../../src/lib/brewer'

describe('brewer', () => {
	const baseSwatch = get(swatch)
	it('should generate a set of patterns for given values', () => {
		const values = ['a', 'b', 'c', 'd']
		const result = getFillPatterns(values, baseSwatch)
		expect(result).toEqual({
			a: { color: 'gold', pattern: 'Brick' },
			b: { color: 'lavender', pattern: 'Circles' },
			c: { color: 'teal', pattern: 'Dots' },
			d: { color: 'rose', pattern: 'CrossHatch' }
		})
	})
})
