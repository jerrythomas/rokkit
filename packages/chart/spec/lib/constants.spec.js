import { describe, it, expect } from 'vitest'
import * as items from '../../src/lib/constants.js'

describe('constants', () => {
	it('should contain all exports', () => {
		expect(Object.keys(items)).toEqual([
			'__patterns__',
			'palette',
			'__muted__',
			'__colors__',
			'colors'
		])
	})
})
