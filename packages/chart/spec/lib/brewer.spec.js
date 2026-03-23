import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { swatch } from '../../src/old_lib/swatch'
import { getFillPatterns } from '../../src/old_lib/brewer'

describe('brewer', () => {
	const baseSwatch = get(swatch)
	it('should generate a set of patterns for given values', () => {
		const values = ['a', 'b', 'c', 'd']
		const result = getFillPatterns(values, baseSwatch)
		expect(result).toEqual({
			a: { color: 'gold', pattern: 'Brick' },
			b: { color: 'lavender', pattern: 'Checkerboard' },
			c: { color: 'teal', pattern: 'CircleGrid' },
			d: { color: 'rose', pattern: 'Circles' }
		})
	})
})
