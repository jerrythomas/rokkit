import { describe, it, expect } from 'vitest'
import * as mocks from '../../src/mocks'

describe('mocks', () => {
	it('should contain all exported mocks', () => {
		expect(Object.keys(mocks)).toEqual([
			'matchMediaMock',
			'updateMedia',
			'getMockNode',
			'createNestedElement'
		])
	})
})
