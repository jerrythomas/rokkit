import { describe, it, expect } from 'vitest'
import * as wrappers from '../../src/wrappers'

describe('wrappers', () => {
	it('should contain all exported wrapper components', () => {
		expect(Object.keys(wrappers)).toEqual(['Wrapper', 'Section', 'Category'])
	})
})
