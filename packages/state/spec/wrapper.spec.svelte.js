import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataWrapper } from '../src/wrapper.svelte'
import { SvelteSet } from 'svelte/reactivity'
import { flushSync } from 'svelte'

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
			{ depth: 0, path: [0], parent: null, item: items[0] },
			{ depth: 0, path: [1], parent: null, item: items[1] },
			{ depth: 0, path: [2], parent: null, item: items[2] }
		])

		items[0].name = 'Updated Item 1'
		items[1].description = 'Updated Description 2'
		items[2].id = 4

		flushSync()
		expect(wrapper.data).toEqual([
			{ depth: 0, path: [0], parent: null, item: items[0] },
			{ depth: 0, path: [1], parent: null, item: items[1] },
			{ depth: 0, path: [2], parent: null, item: items[2] }
		])
	})

	describe('list movement', () => {
		const events = { move: vi.fn(), select: vi.fn(), expand: vi.fn(), collapse: vi.fn() }
		const list = $state([
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

		beforeEach(() => {
			vi.clearAllMocks()
		})

		it('should move to next item', () => {
			const wrapper = new DataWrapper(list, list[0], null, events)
			expect(wrapper.current).toEqual(0)

			wrapper.moveNext()
			expect(wrapper.current).toEqual(1)
			expect(events.move).toHaveBeenCalledWith(list[1])

			wrapper.moveNext()
			expect(wrapper.current).toEqual(2)
			expect(events.move).toHaveBeenCalledWith(list[2])

			wrapper.moveNext()
			expect(wrapper.current).toEqual(2)
			expect(events.move).toHaveBeenCalledTimes(2)
		})

		it('should move to previous item', () => {
			const wrapper = new DataWrapper(list, list[2], null, events)
			expect(wrapper.current).toEqual(2)

			wrapper.movePrevious()
			expect(wrapper.current).toEqual(1)
			expect(events.move).toHaveBeenCalledWith(list[1])

			wrapper.movePrevious()
			expect(wrapper.current).toEqual(0)
			expect(events.move).toHaveBeenCalledWith(list[0])

			wrapper.movePrevious()
			expect(wrapper.current).toEqual(0)
			expect(events.move).toHaveBeenCalledTimes(2)
		})
		it('should move to first item', () => {
			const wrapper = new DataWrapper(list, list[2], null, events)
			expect(wrapper.current).toEqual(2)

			wrapper.moveFirst()
			expect(wrapper.current).toEqual(0)
			expect(events.move).toHaveBeenCalledWith(list[0])

			wrapper.moveFirst()
			expect(wrapper.current).toEqual(0)
			expect(events.move).toHaveBeenCalledTimes(1)
		})
		it('should move to last item', () => {
			const wrapper = new DataWrapper(list, list[0], null, events)
			expect(wrapper.current).toEqual(0)

			wrapper.moveLast()
			expect(wrapper.current).toEqual(2)
			expect(events.move).toHaveBeenCalledWith(list[2])

			wrapper.moveLast()
			expect(wrapper.current).toEqual(2)
			expect(events.move).toHaveBeenCalledTimes(1)
		})
	})
})
