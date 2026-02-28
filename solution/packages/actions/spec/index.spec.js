import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as actions from '../src/index.js'

describe('actions', () => {
	it('should contain all exported actions', () => {
		expect(Object.keys(actions)).toEqual([
			'Navigator',
			'buildKeymap',
			'resolveAction',
			'ACTIONS',
			'keyboard',
			'pannable',
			'swipeable',
			'navigator',
			'themable',
			'skinnable',
			'dismissable',
			'navigable',
			'fillable',
			'delegateKeyboardEvents',
			'reveal',
			'hoverLift',
			'magnetic',
			'ripple'
		])
	})
})
