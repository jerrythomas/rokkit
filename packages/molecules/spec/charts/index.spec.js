import { describe, it, expect } from 'vitest'
import * as components from '../../src/charts'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual(['DefinePatterns', 'Symbol'])
	})
})
