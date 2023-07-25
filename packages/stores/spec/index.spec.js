import { describe, it, expect } from 'vitest'
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
			'timer'
		])
	})
})
