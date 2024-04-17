import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as items from '../../src/lib'

describe('lib', () => {
	it('should include all exported items', () => {
		expect(Object.keys(items)).toEqual([
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
			'generateTreeTable'
		])
	})
})
