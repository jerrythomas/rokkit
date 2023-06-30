import { describe, it, expect } from 'vitest'
import { id } from '../../src/lib/utils'

describe('utils', () => {
	it('should generate a random id', () => {
		const value = id()
		expect(typeof value).toBe('string')
		expect(value.length).toEqual(9)
	})
})
