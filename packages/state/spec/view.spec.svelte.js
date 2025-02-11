import { describe, it, expect, beforeEach } from 'vitest'
import { View } from '../src/view.svelte.js'
import { flushSync } from 'svelte'

describe('View', () => {
	describe('constructor', () => {
		it('should initialize with empty data when no items provided', () => {
			const view = new View([])
			expect(view.data).toEqual([])
			expect(view.currentIndex).toBe(-1)
			expect(view.value).toBe(null)
			expect(view.selectedItems).toEqual([])
			// expect(view.fields).toBeDefined()
		})

		it('should initialize with provided items as flat list', () => {
			const items = [
				{ id: 1, value: 'item 1' },
				{ id: 2, value: 'item 2' }
			]
			const view = new View(items)
			expect(view.data).toEqual([
				{
					indexPath: [0],
					isSelected: false,
					value: { id: 1, value: 'item 1' }
				},
				{ indexPath: [1], isSelected: false, value: { id: 2, value: 'item 2' } }
			])
			expect(view.currentIndex).toBe(0)
			expect(view.value).toEqual(items[0])
		})

		it('should initialize with nested items when nested option is true', () => {
			const items = [{ id: 1, value: 'parent', children: [{ id: 2, value: 'child' }] }]
			const view = new View(items, { nested: true })
			expect(view.data[0].children).toBeDefined()
			expect(view.data[0].children[0].value).toEqual({ id: 2, value: 'child' })
		})
	})

	describe('movement methods', () => {
		const events = {
			move: vi.fn()
		}
		describe('moveByOffset', () => {
			beforeEach(() => {
				events.move.mockClear()
			})
			it('should move current index by positive offset', () => {
				const items = [
					{ id: 1, value: 'item 1' },
					{ id: 2, value: 'item 2' },
					{ id: 3, value: 'item 3' }
				]
				const view = new View(items)
				view.on(events)
				view.moveByOffset(1)
				expect(view.currentIndex).toBe(1)
				expect(view.value).toEqual(items[1])
				expect(events.move).toHaveBeenCalledWith({ index: 1, value: items[1] })
			})

			it('should move current index by negative offset', () => {
				const items = [
					{ id: 1, value: 'item 1' },
					{ id: 2, value: 'item 2' },
					{ id: 3, value: 'item 3' }
				]
				const view = new View(items)
				view.on(events)
				view.currentIndex = 2

				view.moveByOffset(-1)
				expect(view.currentIndex).toBe(1)
				expect(view.value).toEqual(items[1])
				expect(events.move).toHaveBeenCalledWith({ index: 1, value: items[1] })
			})

			it('should not move beyond array bounds', () => {
				const items = [
					{ id: 1, value: 'item 1' },
					{ id: 2, value: 'item 2' }
				]
				const view = new View(items)
				view.on(events)
				view.moveByOffset(5)
				expect(view.currentIndex).toBe(1)
				expect(events.move).toHaveBeenCalledWith({ index: 1, value: items[1] })

				view.moveByOffset(-5)
				expect(view.currentIndex).toBe(0)
				expect(events.move).toHaveBeenCalledWith({ index: 0, value: items[0] })
				expect(events.move).toHaveBeenCalledTimes(2)

				view.moveByOffset(-1)
				expect(view.currentIndex).toBe(0)
				expect(events.move).toHaveBeenCalledTimes(2)
			})
		})
	})

	describe('selection methods', () => {
		const items = [
			{ id: 1, value: 'item 1' },
			{ id: 2, value: 'item 2', children: [{ id: 3, value: 'item 2.1' }] },
			{ id: 4, value: 'item 3' }
		]
		const events = {
			select: vi.fn()
		}
		beforeEach(() => {
			events.select.mockClear()
		})

		describe('select', () => {
			it('should select item at given index', () => {
				const view = new View(items)
				view.on(events)
				view.select(1)
				expect(view.data[1].isSelected).toBe(true)
				expect(view.selectedItems).toEqual([1])
				expect(events.select).toHaveBeenCalledWith([items[1]])
			})

			it('should select nested item using index path', () => {
				const view = new View(items, { nested: true })
				view.on(events)
				view.select([1, 0]) // Select first child of second item
				expect(view.data[2].isSelected).toBe(true)
				expect(view.selectedItems).toEqual([2])
				expect(events.select).toHaveBeenCalledWith([items[1].children[0]])
			})
		})

		describe('unselect', () => {
			it('should unselect item at given index', () => {
				const view = new View(items)
				view.on(events)
				view.select(1)
				expect(events.select).toHaveBeenCalledWith([items[1]])
				view.unselect(1)
				expect(view.data[1].isSelected).toBe(false)
				expect(view.selectedItems).toEqual([])
				expect(events.select).toHaveBeenCalledWith([])
			})
		})

		describe('toggleSelection', () => {
			it('should toggle selection state of item', () => {
				const view = new View(items)
				view.on(events)
				// Toggle on
				view.toggleSelection(1)
				flushSync()
				expect(view.data[1].isSelected).toBe(true)
				expect(view.selectedItems).toEqual([1])
				expect(events.select).toHaveBeenCalledWith([items[1]])

				// Toggle off
				view.toggleSelection(1)
				flushSync()
				expect(view.data[1].isSelected).toBe(false)
				expect(view.selectedItems).toEqual([])
				expect(events.select).toHaveBeenCalledWith([])
			})
		})
	})
})
