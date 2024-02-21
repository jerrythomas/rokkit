import { describe, it, expect } from 'vitest'
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
			'fillable',
			'pannable',
			'navigable',
			'navigator',
			'dismissable',
			'themable',
			'swipeable',
			'switchable',
			'delegateKeyboardEvents'
		])
	})
})
