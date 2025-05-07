import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as mocks from '../../src/mocks'

describe('mocks', () => {
	it('should contain all exported mocks', () => {
		expect(Object.keys(mocks)).toEqual([
			'matchMediaMock',
			'updateMedia',
			'elementsWithSize',
			'mixedSizeElements',
			'getMockNode',
			'createNestedElement',
			'mockFormRequestSubmit'
		])
	})
})
