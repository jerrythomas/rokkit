import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src/index.js'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'DataWrapper',
			'TableWrapper',
			'NodeProxy',
			'ListProxy',
			'NestedProxy',
			'Proxy',
			'vibe',
			'ListController'
		])
	})
})
