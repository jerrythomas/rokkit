import { describe, it, expect, beforeEach } from 'vitest'
import { ListProxy } from '../src/list-proxy.svelte.js'

describe('ListProxy', () => {
	let proxy
	let testData

	beforeEach(() => {
		testData = [
			{ id: 1, name: 'Item 1' },
			{ id: 2, name: 'Item 2' },
			{ id: 3, name: 'Item 3' }
		]
		proxy = new ListProxy(testData)
	})

	describe('constructor', () => {
		it('should initialize with the provided data', () => {
			expect(proxy.data).toEqual(testData)
			expect(proxy.value).toBeUndefined()
			expect(proxy.currentNode).toBeNull()
		})

		it('should initialize with the provided data and value', () => {
			const proxy = new ListProxy(testData, testData[1])
			expect(proxy.data).toEqual(testData)
			expect(proxy.value).toEqual(testData[1])
			expect(proxy.currentNode.value).toEqual(testData[1])
			expect(proxy.currentNode.selected).toBe(true)
			// expect(proxy.currentNode.focused).toBe(true)
		})

		it('should initialize with empty data', () => {
			const emptyProxy = new ListProxy()
			expect(emptyProxy.data).toBeNull()
		})

		it('should initialize with default options', () => {
			expect(proxy.options.multiSelect).toBe(false)
			expect(proxy.options.keyboardNavigation).toBe(true)
		})

		it('should initialize with custom options', () => {
			const customProxy = new ListProxy(testData, null, {}, { multiSelect: true })
			expect(customProxy.options.multiSelect).toBe(true)
		})
	})

	describe('moveNext', () => {
		it('should set current node to the first item when none is selected', () => {
			proxy.moveNext()
			expect(proxy.currentNode.value).toEqual(testData[0])
		})

		it('should move to the next item', () => {
			proxy.moveNext() // To first item
			proxy.moveNext() // To second item
			expect(proxy.currentNode.value).toEqual(testData[1])
		})

		it('should not move past the last item', () => {
			proxy.moveNext() // To first item
			proxy.moveNext() // To second item
			proxy.moveNext() // To third item
			const result = proxy.moveNext() // Should stay on third item

			expect(result).toBe(false)
			expect(proxy.currentNode.value).toEqual(testData[2])
		})

		it('should do nothing for empty data', () => {
			const emptyProxy = new ListProxy()
			const result = emptyProxy.moveNext()

			expect(result).toBe(false)
			expect(emptyProxy.currentNode).toBeNull()
		})
	})

	describe('movePrev', () => {
		it('should set current node to the last item when none is selected', () => {
			proxy.movePrev()
			expect(proxy.currentNode.value).toEqual(testData[2])
		})

		it('should move to the previous item', () => {
			proxy.movePrev() // To last item
			proxy.movePrev() // To second item
			expect(proxy.currentNode.value).toEqual(testData[1])
		})

		it('should not move before the first item', () => {
			proxy.movePrev() // To last item
			proxy.movePrev() // To second item
			proxy.movePrev() // To first item
			const result = proxy.movePrev() // Should stay on first item

			expect(result).toBe(false)
			expect(proxy.currentNode.value).toEqual(testData[0])
		})

		it('should do nothing for empty data', () => {
			const emptyProxy = new ListProxy()
			const result = emptyProxy.movePrev()

			expect(result).toBe(false)
			expect(emptyProxy.currentNode).toBeNull()
		})
	})

	describe('moveTo', () => {
		it('should move to a specific index', () => {
			expect(proxy.moveTo(1)).toBe(true)
			expect(proxy.currentNode.value).toEqual(testData[1])

			expect(proxy.moveTo([0])).toBe(true)
			expect(proxy.currentNode.value).toEqual(testData[0])
		})

		it('should move to a specific item by value', () => {
			const index = proxy.findPathIndex((node) => node.id === '3')
			const result = proxy.moveTo(index) // Assuming it uses the id field

			expect(result).toBe(true)
			expect(proxy.currentNode.id).toBe('3')
		})

		it('should return false for invalid index', () => {
			const result = proxy.moveTo(999)
			expect(result).toBe(false)
		})

		it('should return false for empty data', () => {
			const emptyProxy = new ListProxy()
			const result = emptyProxy.moveTo(0)

			expect(result).toBe(false)
			expect(emptyProxy.currentNode).toBeNull()
		})
	})

	describe('select', () => {
		it('should select the current node', () => {
			proxy.moveNext() // Move to the first item
			proxy.select()

			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('1')).toBe(true) // Assuming id is used as key
		})

		it('should replace previous selection in single select mode', () => {
			proxy.moveNext() // Move to the first item
			proxy.select()

			proxy.moveNext() // Move to the second item
			proxy.select()

			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('2')).toBe(true)
			expect(proxy.selectedNodes.has('1')).toBe(false)
		})

		it('should do nothing if no current node', () => {
			const result = proxy.select()

			expect(result).toBe(false)
			expect(proxy.selectedNodes.size).toBe(0)
		})
	})

	describe('extendSelection', () => {
		beforeEach(() => {
			proxy.options.multiSelect = true
		})

		it('should toggle selection a node in multi-select mode', () => {
			proxy.moveTo(0) // Move to the first item
			proxy.extendSelection()
			expect(proxy.selectedNodes.size).toBe(1)
			// Toggle selection off
			proxy.extendSelection()
			expect(proxy.selectedNodes.size).toBe(0)

			proxy.extendSelection(1)
			expect(proxy.selectedNodes.size).toBe(1)
			// Toggle selection off
			proxy.extendSelection(1)
			expect(proxy.selectedNodes.size).toBe(0)
		})

		it('should allow multiple selections in multi-select mode', () => {
			proxy.moveTo(0) // Move to the first item

			proxy.extendSelection()
			expect(proxy.selectedNodes.size).toBe(1)

			proxy.extendSelection([1])

			expect(proxy.selectedNodes.size).toBe(2)
			expect(proxy.selectedNodes.has('1')).toBe(true)
			expect(proxy.selectedNodes.has('2')).toBe(true)
		})

		it('should behave like select() in single-select mode', () => {
			proxy.options.multiSelect = false

			proxy.moveTo(0) // Move to the first item
			proxy.extendSelection()
			expect(proxy.selectedNodes.size).toBe(1)

			// proxy.moveNext() // Move to the second item
			proxy.extendSelection([1])

			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('2')).toBe(true)
			expect(proxy.selectedNodes.has('1')).toBe(false)
		})

		it('should do nothing if no current node', () => {
			const result = proxy.extendSelection()

			expect(result).toBe(false)
			expect(proxy.selectedNodes.size).toBe(0)
		})
	})

	describe('find', () => {
		it('should find a node by condition', () => {
			const node = proxy.find((item) => item.get('id') === 2)

			expect(node).not.toBeNull()
			expect(node.get('id')).toBe(2)
		})

		it('should return null if no node matches condition', () => {
			const node = proxy.find((item) => item.id === 999)
			expect(node).toBeNull()
		})

		it('should return null for empty data', () => {
			const emptyProxy = new ListProxy()
			const node = emptyProxy.find(() => true)

			expect(node).toBeNull()
		})
	})

	describe('reset', () => {
		it('should clear selected nodes', () => {
			proxy.moveNext()
			proxy.select()
			proxy.reset()

			expect(proxy.selectedNodes.size).toBe(0)
		})

		it('should clear current node', () => {
			proxy.moveNext()
			proxy.reset()

			expect(proxy.currentNode).toBeNull()
		})
	})

	describe('getNodeByPath', () => {
		it('should return node for path', () => {
			expect(proxy.getNodeByPath([0])).toBe(proxy.nodes[0])
		})
		it('should return a node proxy for valid index', () => {
			const node = proxy.getNodeByPath(1)

			expect(node).not.toBeNull()
			expect(node.value).toEqual(testData[1])
		})

		it('should return null for invalid index', () => {
			const node = proxy.getNodeByPath(999)
			expect(node).toBeNull()
		})
	})

	describe('moveToValue', () => {
		it('should move to node with matching value', () => {
			expect(proxy.currentNode).toBeNull()
			expect(proxy.moveToValue(testData[0])).toBe(true)

			expect(proxy.currentNode).not.toBeNull()
			expect(proxy.currentNode.value).toEqual(testData[0])

			expect(proxy.moveToValue(testData[0])).toBe(false)
			expect(proxy.moveToValue(testData[1])).toBe(true)
			expect(proxy.currentNode).not.toBeNull()
			expect(proxy.currentNode.value).toEqual(testData[1])
		})
	})
})
