import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NestedProxy } from '../src/nested-proxy.svelte.js'

describe('NestedProxy', () => {
	let proxy
	let testData

	function expectVisibleNodeIds(proxy, expectedIds) {
		const actualIds = proxy.visibleNodes.map((node) => node.id)
		expect(actualIds).toEqual(expectedIds)
	}

	beforeEach(() => {
		// Create test data with nested structure
		testData = [
			{
				id: 1,
				name: 'Item 1',
				children: [
					{ id: 11, name: 'Item 1.1' },
					{
						id: 12,
						name: 'Item 1.2',
						children: [{ id: 121, name: 'Item 1.2.1' }]
					}
				]
			},
			{
				id: 2,
				name: 'Item 2',
				children: [{ id: 21, name: 'Item 2.1' }]
			}
		]

		// Create spy/mock methods that we'll use to verify behavior
		vi.spyOn(NestedProxy.prototype, 'processNodes')
		vi.spyOn(NestedProxy.prototype, '_refreshFlatNodes')

		proxy = new NestedProxy(testData)
	})

	describe('constructor', () => {
		it('should initialize with the provided data', () => {
			expect(proxy.data).toEqual(testData)
		})

		it('should set default options for tree structures', () => {
			expect(proxy.options.expandedByDefault).toBe(false)
		})

		it('should override default options with provided ones', () => {
			const customProxy = new NestedProxy(testData, {}, { expandedByDefault: true })
			expect(customProxy.options.expandedByDefault).toBe(true)
		})
	})

	describe('update', () => {
		it('should update data and process nodes', () => {
			const newData = [{ id: 3, name: 'New Item' }]
			proxy.processNodes.mockClear()

			proxy.update(newData)

			expect(proxy.data).toEqual(newData)
			expect(proxy.processNodes).toHaveBeenCalledWith(newData)
		})

		it('should reset when no data is provided', () => {
			vi.spyOn(proxy, 'reset')
			proxy.update(null)

			expect(proxy.data).toBeNull()
			expect(proxy.visibleNodes).toEqual([])
			expect(proxy.reset).toHaveBeenCalled()
		})

		it('should return the proxy instance for chaining', () => {
			const result = proxy.update(testData)
			expect(result).toBe(proxy)
		})
	})

	describe('processNodes', () => {
		it('should create node proxies for the data', () => {
			proxy.nodes = []
			proxy.items = [{ id: 1 }, { id: 2 }]
			// NodeProxy.mockClear()

			proxy.processNodes(proxy.items)

			// expect(NodeProxy).toHaveBeenCalledTimes(2)
			expect(proxy._refreshFlatNodes).toHaveBeenCalled()
		})

		it('should do nothing if items is not an array', () => {
			proxy.nodes = []
			proxy._refreshFlatNodes.mockClear()

			proxy.processNodes(null)

			expect(proxy.nodes).toEqual([])
			expect(proxy._refreshFlatNodes).not.toHaveBeenCalled()
		})
	})

	describe('moveNext', () => {
		it('should set current node to the first item when none is selected', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = null
			proxy.moveTo = vi.fn().mockReturnValue(true)

			const result = proxy.moveNext()

			expect(result).toBe(true)
			expect(proxy.moveTo).toHaveBeenCalledWith(0)
		})

		it('should move to the next visible item', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = proxy.visibleNodes[0]
			proxy.moveTo = vi.fn().mockReturnValue(true)

			const result = proxy.moveNext()

			expect(result).toBe(true)
			expect(proxy.moveTo).toHaveBeenCalledWith(1)
		})

		it('should not move past the last item', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = proxy.visibleNodes[1]
			proxy.moveTo = vi.fn()

			const result = proxy.moveNext()

			expect(result).toBe(false)
			expect(proxy.moveTo).not.toHaveBeenCalled()
		})

		it('should return false for empty visible nodes', () => {
			proxy.visibleNodes = []
			proxy.moveTo = vi.fn()

			const result = proxy.moveNext()

			expect(result).toBe(false)
			expect(proxy.moveTo).not.toHaveBeenCalled()
		})
	})

	describe('movePrev', () => {
		it('should set current node to the last item when none is selected', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = null
			proxy.moveTo = vi.fn().mockReturnValue(true)

			const result = proxy.movePrev()

			expect(result).toBe(true)
			expect(proxy.moveTo).toHaveBeenCalledWith(1)
		})

		it('should move to the previous visible item', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = proxy.visibleNodes[1]
			proxy.moveTo = vi.fn().mockReturnValue(true)

			const result = proxy.movePrev()

			expect(result).toBe(true)
			expect(proxy.moveTo).toHaveBeenCalledWith(0)
		})

		it('should not move before the first item', () => {
			proxy.visibleNodes = [{ id: '1' }, { id: '2' }]
			proxy.currentNode = proxy.visibleNodes[0]
			proxy.moveTo = vi.fn()

			const result = proxy.movePrev()

			expect(result).toBe(false)
			expect(proxy.moveTo).not.toHaveBeenCalled()
		})

		it('should return false for empty visible nodes', () => {
			proxy.visibleNodes = []
			proxy.moveTo = vi.fn()

			const result = proxy.movePrev()

			expect(result).toBe(false)
			expect(proxy.moveTo).not.toHaveBeenCalled()
		})
	})

	describe('moveTo', () => {
		it('should move to a node specified by path', () => {
			const result = proxy.moveTo([0])

			expect(result).toBe(true)
			expect(proxy.currentNode.id).toEqual('1')
			expect(proxy.currentNode.focused).toBe(true)
		})

		it('should move to a node specified by index', () => {
			const result = proxy.moveTo(1)

			expect(result).toBe(true)
			expect(proxy.currentNode.id).toEqual('2')
			expect(proxy.currentNode.focused).toBe(true)
		})

		it('should unfocus the previous node', () => {
			proxy.moveTo(1)
			const prevNode = proxy.currentNode
			proxy.moveTo(0)

			expect(prevNode.focused).toBe(false)
			expect(proxy.currentNode.focused).toBe(true)
		})

		it('should return false if node not found', () => {
			// proxy.getNodeByPath.mockReturnValueOnce(null)

			const result = proxy.moveTo(999)
			expect(result).toBe(false)
			expect(proxy.currentNode).not.toBe(999)
		})
	})
	describe('getNodeByPath', () => {
		it('should return the node at the given path', () => {
			let result = proxy.getNodeByPath([0])
			expect(result.id).toEqual('1')
			result = proxy.getNodeByPath([0, 0])
			expect(result.id).toEqual('11')
		})

		it('should return null if node not found', () => {
			const result = proxy.getNodeByPath([999])

			expect(result).toBe(null)
		})
	})

	describe('ensureVisible', () => {
		it('should return true for top-level nodes', () => {
			const node = { path: [0] }
			const result = proxy.ensureVisible(node)
			expect(result).toBe(true)
		})

		it('should expand parent nodes', () => {
			const result = proxy.ensureVisible(proxy.getNodeByPath([0, 1, 0]))

			expect(result).toBe(true)
			expect(proxy.nodes[0].expanded).toBe(true)
			expect(proxy.nodes[0].children[1].expanded).toBe(true)
		})

		it('should return true if node has no path', () => {
			const result = proxy.ensureVisible({})
			expect(result).toBe(true)
		})
	})

	describe('select', () => {
		it('should select the current node', () => {
			expect(proxy.currentNode).toBe(null)
			expect(proxy.select()).toBe(false)

			proxy.moveTo([0])
			expect(proxy.select()).toBe(true)
			expect(proxy.currentNode.selected).toBe(true)
			expect(proxy.selectedNodes.get('1')).toBe(proxy.currentNode)
		})

		it('should clear previous selections in single-select mode', () => {
			// proxy.options.multiSelect = false
			expect(proxy.options.multiSelect).toBe(false)
			proxy.moveTo([0])
			expect(proxy.select()).toBe(true)
			const prevNode = proxy.currentNode
			expect(prevNode.selected).toBe(true)
			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('1')).toBe(true)

			proxy.moveTo([0, 0])
			expect(proxy.select()).toBe(true)

			expect(proxy.nodes[0].selected).toBe(false)
			expect(proxy.currentNode.selected).toBe(true)
			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('11')).toBe(true)
		})

		it('should return false if no current node', () => {
			proxy.currentNode = null
			const result = proxy.select()
			expect(result).toBe(false)
		})
	})

	describe('extendSelection', () => {
		it('should toggle selection of current node in multi-select mode', () => {
			proxy.options.multiSelect = true

			// Select the node
			proxy.moveTo([1])
			proxy.extendSelection()
			expect(proxy.currentNode.selected).toBe(true)
			expect(proxy.selectedNodes.size).toBe(1)
			expect(proxy.selectedNodes.has('2')).toBeTruthy()

			// Deselect the node
			proxy.extendSelection()
			expect(proxy.currentNode.selected).toBe(false)
			expect(proxy.selectedNodes.has('2')).toBe(false)
		})

		it('should behave like select in single-select mode', () => {
			vi.spyOn(proxy, 'select')
			proxy.options.multiSelect = false
			proxy.moveTo([0])
			// proxy.select = vi.fn().mockReturnValue(true)

			const result = proxy.extendSelection()

			expect(result).toBe(true)
			expect(proxy.select).toHaveBeenCalled()
		})
	})

	describe('expand', () => {
		it('should expand a collapsed node and show its children', () => {
			// Initially only root nodes should be visible
			expectVisibleNodeIds(proxy, ['1', '2'])

			// Move to first node and expand it
			proxy.moveTo(0)
			const result = proxy.expand()

			expect(result).toBe(true)
			expect(proxy.currentNode.expanded).toBe(true)
			// Root nodes + children of first node
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])
		})

		it('should return false if current node is already expanded', () => {
			proxy.moveTo(0)
			proxy.currentNode.expanded = true
			proxy._refreshFlatNodes()

			const result = proxy.expand()

			expect(result).toBe(false)
		})

		it('should return false if current node has no children', () => {
			expectVisibleNodeIds(proxy, ['1', '2'])
			// Move to a leaf node
			proxy.moveTo([0, 0])
			const result = proxy.expand()
			expect(result).toBe(false)
			expectVisibleNodeIds(proxy, ['1', '2'])
		})

		it('should return false if no current node', () => {
			proxy.currentNode = null
			const result = proxy.expand()

			expect(result).toBe(false)
			expectVisibleNodeIds(proxy, ['1', '2'])
		})

		it('should show nested children when expanding multiple levels', () => {
			// First expand the root node
			proxy.moveTo(0)
			proxy.expand()
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])

			// Then move to child with grandchildren and expand
			proxy.moveTo([0, 1]) // Move to Item 1.2
			const result = proxy.expand()

			expect(result).toBe(true)
			expectVisibleNodeIds(proxy, ['1', '11', '12', '121', '2'])
		})
	})

	describe('collapse', () => {
		it('should collapse an expanded node and hide its children', () => {
			// First expand the node
			proxy.moveTo(0)
			proxy.expand()
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])

			// Then collapse it

			expect(proxy.collapse()).toBe(true)
			expect(proxy.currentNode.expanded).toBe(false)
			expectVisibleNodeIds(proxy, ['1', '2'])
		})

		it('should return false if current node is already collapsed', () => {
			proxy.moveTo(0)
			expect(proxy.collapse()).toBe(false)
			expect(proxy.collapse()).toBe(false)
		})

		it('should return false if current node has no children', () => {
			proxy.moveTo(0)
			proxy.expand() // Expand first to see children
			proxy.moveNext() // Move to first child

			const result = proxy.collapse()
			expect(result).toBe(false)
		})

		it('should return false if no current node', () => {
			proxy.currentNode = null
			const result = proxy.collapse()
			expect(result).toBe(false)
		})

		it('should hide all nested children when collapsing a parent', () => {
			// Expand multiple levels
			proxy.moveTo(0)
			proxy.expand()
			proxy.moveTo([0, 1]) // Move to Item 1.2
			proxy.expand()
			expectVisibleNodeIds(proxy, ['1', '11', '12', '121', '2'])

			// Now collapse the root
			proxy.moveTo(0)
			expect(proxy.collapse()).toBe(true)
			// Should hide all children and grandchildren
			expectVisibleNodeIds(proxy, ['1', '2'])
			expect(proxy.collapse()).toBe(false)
		})
	})

	describe('toggleExpansion', () => {
		it('should expand a collapsed node', () => {
			proxy.moveTo(0)
			proxy.collapse()

			const result = proxy.toggleExpansion()

			expect(result).toBe(true)
			expect(proxy.currentNode.expanded).toBe(true)
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])
		})

		it('should collapse an expanded node', () => {
			proxy.moveTo(0)
			proxy.collapse()

			expect(proxy.toggleExpansion()).toBe(true)
			expect(proxy.currentNode.expanded).toBe(true)
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])

			expect(proxy.toggleExpansion()).toBe(true)
			expect(proxy.currentNode.expanded).toBe(false)
			expectVisibleNodeIds(proxy, ['1', '2'])
		})

		it('should return false if current node has no children', () => {
			proxy.moveTo([0, 0])
			const result = proxy.toggleExpansion()
			expect(result).toBe(false)
		})

		it('should return false if no current node', () => {
			proxy.currentNode = null
			const result = proxy.toggleExpansion()

			expect(result).toBe(false)
		})
	})

	describe('expandAll', () => {
		it('should expand all nodes in the tree', () => {
			const result = proxy.expandAll()

			expect(result).toBe(proxy)
			expectVisibleNodeIds(proxy, ['1', '11', '12', '121', '2', '21'])
		})
	})

	describe('collapseAll', () => {
		it('should collapse all nodes in the tree', () => {
			proxy.expandAll()
			expectVisibleNodeIds(proxy, ['1', '11', '12', '121', '2', '21'])

			// Then collapse all
			const result = proxy.collapseAll()
			expect(result).toBe(proxy) // Should return self for chaining

			// Only root nodes should be visible
			expectVisibleNodeIds(proxy, ['1', '2'])
		})
	})

	describe('reset', () => {
		it('should reset all expansion and selection state', () => {
			// Setup some expanded and selected state
			proxy.moveTo(0)
			proxy.expand()
			proxy.select()
			expectVisibleNodeIds(proxy, ['1', '11', '12', '2'])
			expect(proxy.selectedNodes.size).toBe(1)

			const result = proxy.reset()

			expect(result).toBe(proxy)

			// Current node should be cleared
			expect(proxy.currentNode).toBeNull()
			expect(proxy.selectedNodes.size).toBe(0)
		})

		it('should expand all nodes if expandedByDefault is true', () => {
			proxy.options.expandedByDefault = true
			proxy.expandAll = vi.fn()

			proxy.reset()

			expect(proxy.expandAll).toHaveBeenCalled()
		})
	})
})
