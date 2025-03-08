import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataWrapper } from '../src/nested.svelte'
import { FieldMapper } from '@rokkit/core'
import { flushSync } from 'svelte'

describe('DataWrapper', () => {
	let navigator
	let mapper
	const events = {
		select: vi.fn(),
		move: vi.fn(),
		expand: vi.fn(),
		collapse: vi.fn()
	}
	const testData = [
		{
			id: 1,
			text: 'Item 1',
			_open: true,
			children: [
				{
					id: 2,
					text: 'Item 1.1',
					_open: false,
					children: []
				},
				{
					id: 3,
					text: 'Item 1.2',
					_open: true,
					children: [
						{
							id: 4,
							text: 'Item 1.2.1'
						}
					]
				}
			]
		},
		{
			id: 5,
			text: 'Item 2',
			_open: false,
			children: [
				{
					id: 6,
					text: 'Item 2.1'
				}
			]
		}
	]
	const value = testData[0]

	beforeEach(() => {
		vi.clearAllMocks()
		mapper = new FieldMapper()
		navigator = new DataWrapper(testData, mapper, value, { events })
	})

	describe('init', () => {
		it('should initialize with correct data', () => {
			let navigator = new DataWrapper(testData, mapper, value, { events })
			expect(navigator.currentNode.id).toBe(1)
			expect(navigator.currentNode.text).toBe('Item 1')
			expect(navigator.currentNode.children.length).toBe(2)

			navigator = new DataWrapper(testData, mapper, undefined, { events })
			expect(navigator.currentNode).toBe(null)

			navigator = new DataWrapper(testData, mapper, testData[0].children[1], { events })
			expect(navigator.currentNode.id).toBe(3)
			expect(navigator.currentNode.text).toBe('Item 1.2')
			expect(navigator.currentNode.children.length).toBe(1)

			navigator = new DataWrapper(testData, mapper, testData[0].children[1].children[0], { events })
			expect(navigator.currentNode.id).toBe(4)
			expect(navigator.currentNode.text).toBe('Item 1.2.1')
			expect(navigator.currentNode.children).toBeUndefined()
		})
	})

	describe('traversal', () => {
		it('should not move if path is not provided', () => {
			navigator.moveTo()
			expect(events.move).not.toHaveBeenCalled()

			navigator.moveTo([])
			expect(navigator.currentNode).toBe(null)
			expect(events.move).not.toHaveBeenCalled()
		})

		it('should handle integer in path', () => {
			navigator.moveTo(1)
			expect(navigator.currentNode.id).toBe(5)
			expect(events.move).toHaveBeenCalledWith({ path: [1], node: navigator.currentNode })
		})

		it('should move to first node', () => {
			navigator.moveTo([])
			navigator.movePrev()
			expect(navigator.currentNode.id).toBe(1) // Item 1
			expect(events.move).toHaveBeenCalledWith({ path: [0], node: navigator.currentNode })
		})

		it('should move to previous sibling if available', () => {
			// Set initial position to Item 1.2 [0, 1]
			navigator.moveTo([0, 1])
			expect(navigator.currentNode.id).toBe(3) // Item 1.2
			expect(events.move).toHaveBeenCalledWith({ path: [0, 1], node: navigator.currentNode })

			navigator.movePrev()
			expect(navigator.currentNode.id).toBe(2) // Item 1.1
			expect(events.move).toHaveBeenCalledWith({ path: [0, 0], node: navigator.currentNode })
		})

		it('should move to parent if no previous sibling exists', () => {
			// Set initial position to Item 1.1 [0, 0]
			navigator.moveTo([0, 0])
			expect(navigator.currentNode.id).toBe(2) // Item 1.1
			expect(events.move).toHaveBeenCalledWith({ path: [0, 0], node: navigator.currentNode })

			navigator.movePrev()
			expect(navigator.currentNode.id).toBe(1) // Item 1
			expect(events.move).toHaveBeenCalledWith({ path: [0], node: navigator.currentNode })
		})

		it('should move to last visible child of previous expanded sibling', () => {
			// Set initial position to Item 2 [1]
			navigator.moveTo([1])
			expect(navigator.currentNode.id).toBe(5) // Item 2
			expect(events.move).toHaveBeenCalledWith({ path: [1], node: navigator.currentNode })

			navigator.movePrev()
			expect(navigator.currentNode.id).toBe(4) // Item 1.2.1
			expect(events.move).toHaveBeenCalledWith({ path: [0, 1, 0], node: navigator.currentNode })
		})

		it('should not move if at first item', () => {
			// At first item [0]
			navigator.moveTo([0])
			expect(events.move).not.toHaveBeenCalled()
			navigator.movePrev()
			expect(navigator.currentNode.id).toBe(1) // Still at Item 1
			expect(events.move).not.toHaveBeenCalled()
		})

		it('should move to first child when current node is expanded', () => {
			// Starting at Item 1 [0] which is expanded
			expect(navigator.currentNode.id).toBe(1)

			navigator.moveNext()
			expect(navigator.currentNode.id).toBe(2) // Item 1.1
			expect(events.move).toHaveBeenCalledWith({
				path: [0, 0],
				node: navigator.currentNode
			})
		})

		it('should move to next sibling when current node is collapsed', () => {
			// At Item 1.1 [0, 0] which is collapsed
			navigator.moveTo([0, 0])
			expect(navigator.currentNode.id).toBe(2)

			navigator.moveNext()
			expect(navigator.currentNode.id).toBe(3) // Item 1.2
			expect(events.move).toHaveBeenCalledWith({
				path: [0, 1],
				node: navigator.currentNode
			})
		})

		it("should move to parent's next sibling when at last child", () => {
			// At Item 1.2.1 [0, 1, 0]
			navigator.moveTo([0, 1, 0])
			expect(navigator.currentNode.id).toBe(4)

			navigator.moveNext()
			expect(navigator.currentNode.id).toBe(5) // Item 2
			expect(events.move).toHaveBeenCalledWith({
				path: [1],
				node: navigator.currentNode
			})
		})

		it('should not move when at last node', () => {
			// At Item 2 [1] which is the last node
			navigator.moveTo([1])
			expect(navigator.currentNode.id).toBe(5)
			vi.clearAllMocks()
			navigator.moveNext()
			expect(navigator.currentNode.id).toBe(5) // Still at Item 2
			expect(events.move).not.toHaveBeenCalled()
		})
	})

	describe('expansion', () => {
		it('should expand node', () => {
			// At Item 1 [0] which is collapsed
			navigator.moveTo([0])
			expect(navigator.currentNode.id).toBe(1)

			navigator.expand()
			expect(navigator.currentNode.id).toBe(1) // Still at Item 1
			expect(events.expand).not.toHaveBeenCalled()

			navigator.moveTo([1])
			expect(navigator.currentNode.id).toBe(5)

			navigator.expand()
			expect(navigator.currentNode.id).toBe(5) // Still at Item 2
			expect(events.expand).toHaveBeenCalledWith({
				path: [1],
				node: navigator.currentNode
			})
		})

		it('should collapse node', () => {
			// At Item 1 [0] which is expanded
			navigator.moveTo([0])
			expect(navigator.currentNode.id).toBe(1)

			navigator.collapse()
			expect(navigator.currentNode.id).toBe(1) // Still at Item 1
			expect(events.collapse).toHaveBeenCalledWith({
				path: [0],
				node: navigator.currentNode
			})
		})

		it('should toggle node', () => {
			// At Item 1 [0] which is collapsed
			navigator.moveTo([0])
			expect(navigator.currentNode.id).toBe(1)

			navigator.toggleExpansion()
			expect(navigator.currentNode.id).toBe(1) // Still at Item 1
			expect(events.expand).not.toHaveBeenCalled()
			expect(events.collapse).toHaveBeenCalledWith({
				path: [0],
				node: navigator.currentNode
			})

			vi.clearAllMocks()
			navigator.toggleExpansion()
			expect(navigator.currentNode.id).toBe(1) // Still at Item 1
			expect(events.collapse).not.toHaveBeenCalled()
			expect(events.expand).toHaveBeenCalledWith({
				path: [0],
				node: navigator.currentNode
			})
		})

		it('should not emit event nodes without children', () => {
			navigator.moveTo([0, 0])
			expect(navigator.currentNode.id).toBe(2)

			navigator.collapse()
			expect(navigator.currentNode.id).toBe(2)
			expect(events.collapse).not.toHaveBeenCalled()

			navigator.expand()
			expect(navigator.currentNode.id).toBe(2)
			expect(events.expand).not.toHaveBeenCalled()

			navigator.toggleExpansion()
			expect(navigator.currentNode.id).toBe(2)
			expect(events.expand).not.toHaveBeenCalled()
			expect(events.collapse).not.toHaveBeenCalled()
		})
	})

	describe('selection', () => {
		it('should select node', () => {
			navigator.select([0])
			expect(navigator.currentNode.id).toBe(1)
			expect(events.move).not.toHaveBeenCalled()
			expect(events.select).toHaveBeenCalledWith({
				path: [0],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()]).toEqual([navigator.currentNode])
		})

		it('should emit move event if node changed', () => {
			navigator.select([0, 0])
			expect(navigator.currentNode.id).toBe(2)
			expect(events.move).toHaveBeenCalledWith({
				path: [0, 0],
				node: navigator.currentNode
			})
			expect(events.select).toHaveBeenCalledWith({
				path: [0, 0],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()]).toEqual([navigator.currentNode])
		})

		it('should extend selection by adding or removing', () => {
			const navigator = new DataWrapper(testData, mapper, value, { events, multiselect: true })

			navigator.extendSelection([0, 0])
			flushSync()

			expect(navigator.currentNode.id).toBe(2)
			expect(events.select).toHaveBeenCalledWith({
				path: [0, 0],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()].map((item) => item.id)).toEqual([2])

			navigator.extendSelection([0, 1])
			flushSync()

			expect(navigator.currentNode.id).toBe(3)
			expect(events.select).toHaveBeenCalledWith({
				path: [0, 1],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()].map((item) => item.id)).toEqual([2, 3])

			navigator.extendSelection([0, 0])
			flushSync()

			expect(navigator.currentNode.id).toBe(2)
			expect(events.select).toHaveBeenCalledWith({
				path: [0, 0],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()].map((item) => item.id)).toEqual([3])

			navigator.extendSelection([0, 1])
			flushSync()

			expect(navigator.currentNode.id).toBe(3)
			expect(events.select).toHaveBeenCalledWith({
				path: [0, 1],
				node: navigator.currentNode,
				selected: navigator.selected
			})
			expect([...navigator.selected.values()].map((item) => item.id)).toEqual([])
		})
	})

	it('should handle when current node is not set', () => {
		const item = $state(null)
		const navigator = new DataWrapper(testData, mapper, item, { events, multiselect: true })

		navigator.moveTo([])
		expect(navigator.currentNode).toBeNull()
		navigator.extendSelection()
		flushSync()

		expect(navigator.currentNode).toBeNull()
		expect(events.select).not.toHaveBeenCalled()
		expect([...navigator.selected.values()].map((item) => item.id)).toEqual([])
	})
})
