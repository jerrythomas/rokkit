import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BaseProxy } from '../src/base-proxy.svelte.js'

// Create a concrete implementation for testing
class TestProxy extends BaseProxy {
	moveNext() {
		return true
	}
	movePrev() {
		return true
	}
	moveTo(target) {
		return Boolean(target)
	}
}

describe('BaseProxy', () => {
	let proxy
	const testData = [
		{ id: 1, name: 'Item 1' },
		{ id: 2, name: 'Item 2' }
	]
	const testFields = { customField: 'customValue' }
	const testOptions = { multiSelect: true }

	beforeEach(() => {
		proxy = new TestProxy(testData, null, testFields, testOptions)
	})

	describe('constructor', () => {
		it('should initialize with the provided data', () => {
			expect(proxy.data).toEqual(testData)
		})

		it('should merge fields with defaultFields', () => {
			expect(proxy.fields).toHaveProperty('customField', 'customValue')
		})

		it('should merge options with default options', () => {
			expect(proxy.options.multiSelect).toBe(true)
			expect(proxy.options.keyboardNavigation).toBe(true)
		})

		it('should set the value', () => {
			const proxy = new TestProxy(testData, testData[1], testFields, testOptions)
			expect(proxy.value).toEqual(testData[1])
		})
	})

	describe('update', () => {
		it('should update data and reset state', () => {
			const newData = [{ id: 3, name: 'New Item' }]
			const resetSpy = vi.spyOn(proxy, 'reset')

			proxy.update(newData)

			expect(proxy.data).toEqual(newData)
			expect(resetSpy).toHaveBeenCalledTimes(1)
		})

		it('should return the proxy instance for chaining', () => {
			const result = proxy.update([])
			expect(result).toBe(proxy)
		})
	})

	describe('reset', () => {
		it('should clear selected nodes', () => {
			proxy.selectedNodes.set('test', {})
			proxy.reset()
			expect(proxy.selectedNodes.size).toBe(0)
		})

		it('should clear current node', () => {
			proxy.currentNode = { id: 'test' }
			proxy.reset()
			expect(proxy.currentNode).toBeNull()
		})

		it('should return the proxy instance for chaining', () => {
			const result = proxy.reset()
			expect(result).toBe(proxy)
		})
	})

	describe('abstract methods', () => {
		it('should throw error if moveNext is not implemented', () => {
			const baseInstance = new BaseProxy([])
			expect(() => baseInstance.moveNext()).toThrow('moveNext() must be implemented by subclass')
		})

		it('should throw error if movePrev is not implemented', () => {
			const baseInstance = new BaseProxy([])
			expect(() => baseInstance.movePrev()).toThrow('movePrev() must be implemented by subclass')
		})

		it('should throw error if moveTo is not implemented', () => {
			const baseInstance = new BaseProxy([])
			expect(() => baseInstance.moveTo(1)).toThrow('moveTo() must be implemented by subclass')
		})

		it('should return false on select', () => {
			const baseInstance = new BaseProxy([])
			expect(baseInstance.select()).toBe(false)
			expect(baseInstance.select(1)).toBe(false)
		})

		it('should return false on extendSelection', () => {
			const baseInstance = new BaseProxy([])
			expect(baseInstance.extendSelection()).toBe(false)
			expect(baseInstance.extendSelection(1)).toBe(false)
		})

		it('should return null on find', () => {
			const baseInstance = new BaseProxy([])
			expect(baseInstance.find(() => true)).toBeNull()
			expect(baseInstance.findPathIndex(() => true)).toEqual([])
		})
	})

	describe('expansion methods', () => {
		it('expand should return false by default', () => {
			expect(proxy.expand()).toBe(false)
		})

		it('collapse should return false by default', () => {
			expect(proxy.collapse()).toBe(false)
		})

		it('toggleExpansion should return false by default', () => {
			expect(proxy.toggleExpansion()).toBe(false)
		})
	})

	describe('concrete implementation', () => {
		it('should not throw on moveNext', () => {
			expect(() => proxy.moveNext()).not.toThrow()
		})

		it('should not throw on movePrev', () => {
			expect(() => proxy.movePrev()).not.toThrow()
		})

		it('should not throw on moveTo', () => {
			expect(() => proxy.moveTo(0)).not.toThrow()
		})

		it('hould use base implementation for select', () => {
			expect(proxy.select()).toEqual(false)
		})

		it('should use base implementation for extendSelection', () => {
			expect(proxy.extendSelection()).toEqual(false)
		})

		it('hould use base implementation for find', () => {
			expect(proxy.find(() => true)).toBeNull()
			expect(proxy.findPathIndex(() => true)).toEqual([])
		})
	})

	describe('getNodeByPath', () => {
		it('should return null if path is empty/invalid', () => {
			expect(proxy.getNodeByPath([])).toBeNull()
			expect(proxy.getNodeByPath()).toBeNull()
		})
	})
})
