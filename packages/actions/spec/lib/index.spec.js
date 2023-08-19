import { describe, it, expect } from 'vitest'
import * as internal from '../../src/lib'

describe('internal', () => {
	it('should contain all internal functions', () => {
		expect(Object.keys(internal)).toEqual([
			'emit',
			'mapKeyboardEventsToActions',
			'getClosestAncestorWithAttribute',
			'setupListeners',
			'removeListeners',
			'handleItemClick',
			'EventManager',
			'ViewPort',
			'ResizableViewport',
			'FillableViewport',
			'ViewportFactory'
		])
	})
})
