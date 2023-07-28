import { describe, it, expect } from 'vitest'
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
