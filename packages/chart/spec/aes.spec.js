import { aes } from '../src/lib/aes'
import { describe, expect, it } from 'vitest'

describe('Aesthetics', () => {
	it('should create an aesthetics object', () => {
		let mapping = aes()
		expect(mapping.x).toBe(undefined)
		expect(mapping.y).toBe(undefined)
		expect(mapping.fill).toBe(undefined)
		expect(mapping.color).toBe(undefined)
		expect(mapping.pattern).toBe(undefined)
		expect(mapping.animate).toBe(undefined)
	})
})
