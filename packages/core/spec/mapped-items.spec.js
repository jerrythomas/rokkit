import { describe, it, expect } from 'vitest'
import { getItemAtIndex, getIndexForItem } from '../src/mapped-items'

describe('MappedItems', () => {
	const items = [
		{
			text: 'Alpha',
			icon: 'fa fa-alpha'
		},
		{
			text: 'Beta',
			icon: 'fa fa-beta'
		},
		{
			text: 'Gamma',
			icon: 'fa fa-gamma'
		}
	]
	it('should get the index of a value in items', () => {
		expect(getIndexForItem(items, items[0])).toEqual(0)
		expect(getIndexForItem(items, { ...items[1] })).toEqual(1)
		expect(getIndexForItem(items, {})).toEqual(-1)
	})

	it('should get the current value from index', () => {
		expect(getItemAtIndex(items, 0)).toEqual(items[0])
		expect(getItemAtIndex(items, 1)).toEqual(items[1])
		expect(getItemAtIndex(items, 2)).toEqual(items[2])
		expect(getItemAtIndex(items, 3)).toBeNull()
		expect(getItemAtIndex(items, null)).toBeNull()
		expect(getItemAtIndex(items, -1)).toBeNull()
	})
})
