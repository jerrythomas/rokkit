import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Accordion',
			'DropDown',
			'DropSearch',
			'DataEditor',
			'Form',
			'List',
			'MultiSelect',
			'NestedList',
			'Select',
			'Switch',
			'Tabs',
			'Tree',
			'InputField',
			'ListEditor',
			// 'VirtualSelect',
			// 'VirtualList',
			'NestedEditor',
			'Table',
			'TreeTable',
			'Toggle',
			'Carousel'
		])
	})
})
