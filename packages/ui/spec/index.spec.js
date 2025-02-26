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
			'InputCheckbox',
			'InputColor',
			'InputDate',
			'InputDateTime',
			'InputEmail',
			'InputFile',
			'InputMonth',
			'InputNumber',
			'InputPassword',
			'InputRadio',
			'InputRange',
			'InputSelect',
			'InputTel',
			'InputText',
			'InputTextArea',
			'InputTime',
			'InputUrl',
			'InputWeek',
			'ListItems',
			'Node',
			'Summary',
			'Toggle',
			'Switch',
			'List',
			'Accordion'
		])
	})
})
