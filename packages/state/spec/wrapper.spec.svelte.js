import { describe, it, expect } from 'vitest'
import { DataWrapper } from '../src/wrapper.svelte'
import { SvelteSet } from 'svelte/reactivity'

describe('DataWrapper', () => {
	it('should handle reactive items', () => {
		const items = $state([
			{
				id: 1,
				name: 'Item 1',
				description: 'Description 1'
			},
			{
				id: 2,
				name: 'Item 2',
				description: 'Description 2'
			},
			{
				id: 3,
				name: 'Item 3',
				description: 'Description 3'
			}
		])

		const wrapper = new DataWrapper(items)
		expect(wrapper.items).toBe(items)
		expect(wrapper.selected).toBeInstanceOf(SvelteSet)
		expect(wrapper.selected.size).toBe(0)
		expect(wrapper.data).toEqual([
			{ selected: false, item: items[0] },
			{ selected: false, item: items[1] },
			{ selected: false, item: items[2] }
		])

		items[0].name = 'Updated Item 1'
		items[1].description = 'Updated Description 2'
		items[2].id = 4

		// flushSync()
		expect(wrapper.data).toEqual([
			{ selected: false, item: items[0] },
			{ selected: false, item: items[1] },
			{ selected: false, item: items[2] }
		])
	})
})
