import { describe, it, expect } from 'vitest'
import { Palette } from '../../src/lib/palette.js'

describe('palette', () => {
	describe('Palette', () => {
		it('should create a color brewer object', () => {
			const data = new Palette()
			expect(data).toBeDefined()
		})
	})
})
