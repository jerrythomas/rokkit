import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { swatch } from '../../src/utils/swatch'
import { getFillPatterns } from '../../src/utils/brewer'

describe('brewer', () => {
	const baseSwatch = get(swatch)
	it('should generate a set of patterns for given values', () => {
		let values = ['a', 'b', 'c', 'd']
		let result = getFillPatterns(values, baseSwatch)
		expect(result).toEqual({
			a: { color: 'gold', pattern: '0' },
			b: { color: 'lavender', pattern: '1' },
			c: { color: 'teal', pattern: '2' },
			d: { color: 'rose', pattern: '3' }
		})
	})
})
