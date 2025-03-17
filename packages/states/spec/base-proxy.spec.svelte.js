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
	select() {
		return true
	}
	extendSelection() {
		return true
	}
	find(condition) {
		return this.data && this.data.find(condition) ? { node: this.data.find(condition) } : null
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
		proxy = new TestProxy(testData, testFields, testOptions)
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

		it('should throw error if select is not implemented', () => {
			const baseInstance = new BaseProxy([])
			expect(() => baseInstance.select()).toThrow('select() must be implemented by subclass')
		})

		it('should throw error if extendSelection is not implemented', () => {
			const baseInstance = new BaseProxy([])
			expect(() => baseInstance.extendSelection()).toThrow(
				'extendSelection() must be implemented by subclass'
			)
		})

		// it('should throw error if find is not implemented', () => {
		// 	const baseInstance = new BaseProxy([])
		// 	expect(() => baseInstance.find(() => true)).toThrow('find() must be implemented by subclass')
		// })
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

		it('should not throw on select', () => {
			expect(() => proxy.select()).not.toThrow()
		})

		it('should not throw on extendSelection', () => {
			expect(() => proxy.extendSelection()).not.toThrow()
		})

		it('should not throw on find', () => {
			expect(() => proxy.find(() => true)).not.toThrow()
		})
	})
})
