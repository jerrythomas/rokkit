import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src/index'

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
			'ProgressBar'
		])
	})
})
