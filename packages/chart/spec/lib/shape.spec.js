import { describe, it, expect } from 'vitest'
import { ShapeBrewer } from '../../src/lib/shape'

describe('shape', () => {
	describe('ShapeBrewer', () => {
		it('should initialize', () => {
			const brewer = new ShapeBrewer()
			expect(brewer).toBeDefined()
		})
	})
})
