import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
// skipcq: JS-E1007 - Importing all components for verification
import * as components from '../src'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Icon',
			'Connector',
			'Separator',
			'DataList',
			'RangeTick',
			'Thumb',
			'Slider',
			'Fillable',
			'ProgressBar',
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
			'ResponsiveGrid',
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
			'Toggle',
			'Carousel',
			'Sidebar',
			'SplitPane',
			'Stepper',
			'ProgressDots',
			'ToggleThemeMode'
		])
	})
})
