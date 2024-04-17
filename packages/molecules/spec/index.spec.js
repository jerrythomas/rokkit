import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Checkbox',
			'Radio',
			'Range',
			'RangeMinMax',
			'Rating',
			'Alerts',
			'BreadCrumbs',
			'Button',
			'ButtonGroup',
			'Calendar',
			'Item',
			'Link',
			'ItemWrapper',
			'Node',
			'Summary',
			'ValidationReport',
			'ResponsiveGrid'
		])
	})
})
