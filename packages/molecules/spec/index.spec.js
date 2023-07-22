import { describe, it, expect } from 'vitest'
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'rokkitInputTypes',
			'RadioGroup',
			'CheckBox',
			'Range',
			'RangeMinMax',
			'Rating',
			'Alerts',
			'BreadCrumbs',
			'Button',
			'ButtonGroup',
			'Calendar',
			'Item',
			'ItemWrapper',
			'Node',
			'Summary',
			'ValidationReport',
			'ResponsiveGrid'
		])
	})
})
