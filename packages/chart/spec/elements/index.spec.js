import { describe, it, expect } from 'vitest'
import * as components from '../../src/elements'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Bar',
			'ColorRamp',
			'ContinuousLegend',
			'Label',
			'DefinePatterns',
			'SymbolGrid'
		])
	})
})
