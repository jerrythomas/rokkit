import { describe, it, expect } from 'vitest'
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'addRootNode',
			'messages',
			'dataTypes',
			'deriveTypeFromValue',
			'deriveSchemaFromValue',
			'deriveLayoutFromValue',
			'getSchemaWithLayout',
			'findAttributeByPath',
			'deriveNestedSchema',
			'flattenAttributes',
			'flattenObject',
			'flattenElement',
			'generateIndex',
			'generateTreeTable',
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
			'VirtualSelect',
			'VirtualList',
			'NestedEditor',
			'Table',
			'TreeTable',
			'Toggle'
		])
	})
})
