import { describe, it, expect } from 'vitest'
import * as utilities from '../src'

describe('utilities', () => {
	it('should contain all exported utilities', () => {
		expect(Object.keys(utilities)).toEqual([
			'iconShortcuts',
			'themeColors',
			'themeRules',
			'defaultStateIcons',
			'defaultIcons',
			'defaultThemeColors',
			'palettes'
		])
	})
})
