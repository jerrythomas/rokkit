import { describe, it, expect } from 'vitest'
import * as utilities from '../src'

describe('utilities', () => {
	it('should contain all exported utilities', () => {
		expect(Object.keys(utilities)).toEqual([
			'defaultFields',
			'defaultIcons',
			'defaultOptions',
			'defaultKeyMap',
			'stateIconsFromNames',
			'defaultStateIcons',
			'flattenNestedList',
			'findValueFromPath',
			'getComponent',
			'getIcon',
			'getId',
			'getText',
			'getLineTypes',
			'generateTicks',
			'weekdays',
			'getCalendarDays',
			'id'
		])
	})
})
