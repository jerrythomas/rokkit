import { describe, it, expect } from 'vitest'
import * as utilities from '../../src/lib'

describe('utilities', () => {
	it('should contain all exported utilities', () => {
		expect(Object.keys(utilities)).toEqual([
			'defaultIcons',
			'defaultOptions',
			'defaultFields',
			'defaultKeyMap',
			'stateIconsFromNames',
			'defaultStateIcons',
			'flattenNestedList',
			'findValueFromPath',
			'getComponent',
			'getIcon',
			'getLineTypes',
			'generateTicks',
			'weekdays',
			'getCalendarDays',
			'id'
		])
	})
})
