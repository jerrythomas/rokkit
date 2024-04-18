import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as validators from '../../src/validators'

describe('validators', () => {
	it('should contain all exported validators', () => {
		expect(Object.keys(validators)).toEqual([
			'toIncludeAll',
			'toUseHandlersFor',
			'toOnlyTrigger',
			'toHaveValidData',
			'toHaveBeenDispatchedWith'
		])
	})
})
