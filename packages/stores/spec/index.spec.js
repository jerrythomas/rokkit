import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as stores from '../src'

describe('stores', () => {
	it('should contain all exported stores', () => {
		expect(Object.keys(stores)).toEqual([
			'watchMedia',
			'theme',
			'alerts',
			'persistable',
			'verifiable',
			'elapsed',
			'timer',
			'createNavigator'
		])
	})
})
