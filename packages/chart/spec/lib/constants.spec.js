import { describe, it, expect } from 'vitest'
import * as items from '../../src/lib/constants.js'

describe('constants', () => {
	it('should contain all exports', () => {
		expect(Object.keys(items)).toEqual([
			'__muted__',
			'__colors__',
			'__patterns__',
			'colors',
			'palette'
		])
	})
})
