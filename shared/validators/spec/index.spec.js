import { describe, it, expect } from 'vitest'
import * as functions from '../src'

describe('functions', () => {
	it('should contain all exported functions', () => {
		expect(Object.keys(functions)).toEqual([
			'toIncludeAll',
			'toUseHandlersFor',
			'toOnlyTrigger',
			'toHaveValidData',
			'toHaveBeenDispatchedWith',
			'getPropertyValue',
			'simulateMouseEvent',
			'simulateTouchEvent',
			'simulateTouchSwipe',
			'simulateMouseSwipe'
		])
	})
})
