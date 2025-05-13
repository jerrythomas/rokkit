import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
// skipcq: JS-E1007 - Importing all components for verification
import * as components from '../../src/tree'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Root',
			'Viewport',
			'Node',
			'NodeList',
			'Line',
			'Empty',
			'Loading'
		])
	})
})
