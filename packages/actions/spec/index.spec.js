import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as actions from '../src/index.js'

describe('actions', () => {
	it('should contain all exported actions', () => {
		expect(Object.keys(actions)).toEqual(['keyboard', 'pannable', 'swipeable'])
	})
})
