import { describe, it, expect } from 'vitest'
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Accordion',
			'DropDown',
			'DropSearch',
			'Form',
			'List',
			'MultiSelect',
			'NestedList',
			'Select',
			'Switch',
			'Tabs',
			'Tree'
		])
	})
})
