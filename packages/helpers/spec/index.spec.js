import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as functions from '../src'

describe('functions', () => {
	it('should contain all exported functions', () => {
		expect(Object.keys(functions)).toEqual([
			'simulateMouseEvent',
			'simulateTouchEvent',
			'simulateTouchSwipe',
			'simulateMouseSwipe'
		])
	})
})
