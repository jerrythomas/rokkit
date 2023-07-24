import { describe, expect, it } from 'vitest'
import { namedShapes } from '../../src/lib/shapes'

describe('Utility functions', () => {
	it.each(Object.keys(namedShapes))('should generate a unique id', (name) => {
		expect(namedShapes[name]).toMatchSnapshot()
	})
})
