import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as internal from '../../src/lib'

describe('internal', () => {
	it('should contain all internal functions', () => {
		expect(Object.keys(internal)).toEqual([
			'dimensionAttributes',
			'defaultResizerOptions',
			'defaultVirtualListOptions',
			'emit',
			'mapKeyboardEventsToActions',
			'getClosestAncestorWithAttribute',
			'setupListeners',
			'removeListeners',
			'handleItemClick',
			'calculateSum',
			'updateSizes',
			'fixViewportForVisibileCount',
			'fitIndexInViewport',
			'EventManager',
			'virtualListViewport'
		])
	})
})
