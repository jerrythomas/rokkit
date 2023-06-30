import { describe, it, expect } from 'vitest'
import * as components from '../../src/components'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Icon',
			'Connector',
			'Separator',
			'Input',
			'DataList',
			'RangeTick',
			'Thumb',
			'Slider'
		])
	})
})
