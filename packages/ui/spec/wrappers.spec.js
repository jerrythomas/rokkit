import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
// skipcq: JS-E1007 - Importing all components for verification
import * as wrappers from '../src/wrappers'

describe('wrappers', () => {
	it('should contain all exported wrapper components', () => {
		expect(Object.keys(wrappers)).toEqual(['Wrapper', 'Section', 'Category'])
	})
})
