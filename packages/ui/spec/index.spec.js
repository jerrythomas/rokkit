import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
// skipcq: JS-E1007 - Importing all components for verification
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Icon',
			'Item',
			'Pill',
			'ProgressBar',
			'Separator',
			'Connector',
			'RangeTick',
			'RangeSlider',
			'Node',
			'Summary',
			'BreadCrumbs',
			'Rating',
			'RangeMinMax',
			'Range',
			'RadioGroup',
			'CheckBox',
			'Calendar',
			'ValidationReport',
			'ResponsiveGrid',
			'Toggle',
			'Switch',
			'List',
			'Accordion',
			'NestedList',
			'Tree',
			'ToggleThemeMode',
			'Overlay',
			'Message',
			'SlidingColumns'
		])
	})
})
