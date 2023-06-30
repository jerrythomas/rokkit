import { describe, it, expect } from 'vitest'
import * as stores from '../../src/stores'

describe('stores', () => {
	it('should contain all exported stores', () => {
		expect(Object.keys(stores)).toEqual([
			'watchMedia',
			'theme',
			'persistable',
			'alerts'
		])
	})
})
