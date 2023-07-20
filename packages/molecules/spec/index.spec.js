import { describe, it, expect } from 'vitest'
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Alerts',
			'BreadCrumbs',
			'Button',
			'ButtonGroup',
			'Calendar',
			'CheckBox',
			'CheckBoxGroup',
			'Item',
			'ItemWrapper',
			'Node',
			'RadioGroup',
			'Range',
			'RangeMinMax',
			'Rating',
			'Summary',
			'ValidationReport',
			'ResponsiveGrid'
		])
	})
})
