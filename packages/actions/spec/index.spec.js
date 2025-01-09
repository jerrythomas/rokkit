import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as actions from '../src'

describe('actions', () => {
	it('should contain all exported actions', () => {
		expect(Object.keys(actions)).toEqual([
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
			'virtualListViewport',
			'keyboard',
			'fillable',
			'pannable',
			'navigable',
			'navigator',
			'dismissable',
			'traversable',
			'themable',
			'swipeable',
			'switchable',
			'delegateKeyboardEvents'
		])
	})
})
