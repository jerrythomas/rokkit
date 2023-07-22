import { describe, it, expect } from 'vitest'
import * as components from '../src/index'

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
			'Slider',
			'Fillable',
			'Markdown',
			'CodeSnippet',
			'ProgressBar',
			'nativeInputTypes'
		])
	})
})
