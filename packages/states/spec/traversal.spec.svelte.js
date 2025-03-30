import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Traversal } from '../src/traversal.svelte.js'

describe('Traversal', () => {
	// Mock data provider
	let mockDataProvider
	let traversal
	let mockNodes

	beforeEach(() => {
		// Create mock data with 3 items
		mockNodes = [
			{ key: '0', value: { id: 1, name: 'Item 1' } },
			{ key: '1', value: { id: 2, name: 'Item 2' } },
			{ key: '2', value: { id: 3, name: 'Item 3' } }
		]

		// Setup mock data provider
		mockDataProvider = {
			nodes: mockNodes,
			lookup: new Map(mockNodes.map((node) => [node.key, { proxy: node.value, depth: 0 }])),
			getItemByKey: vi.fn((key) => {
				const found = mockNodes.find((node) => node.key === key)
				return found ? found.value : null
			}),
			getIndexForKey: vi.fn((key) => mockNodes.findIndex((node) => node.key === key)),
			getKeyForValue: vi.fn((value) => {
				const found = mockNodes.find((node) => node.value === value || node.value.id === value.id)
				return found ? found.key : null
			})
		}

		traversal = new Traversal(mockDataProvider)
	})

	describe('Initial state', () => {
		it('should initialize with null currentKey', () => {
			expect(traversal.currentKey).toBeNull()
		})

		it('should initialize with -1 currentIndex', () => {
			expect(traversal.currentIndex).toBe(-1)
		})

		it('should initialize with null focused item', () => {
			expect(traversal.focused).toBeNull()
		})
	})

	describe('moveToKey', () => {
		it('should set currentKey when a valid key is provided', () => {
			expect(traversal.moveToKey('1')).toBe(true)
			expect(traversal.currentKey).toBe('1')
			expect(traversal.currentIndex).toBe(1)
		})

		it('should return false for invalid keys', () => {
			expect(traversal.moveToKey('invalid')).toBe(false)
			expect(traversal.currentKey).toBeNull()
		})

		it('should return false if the key does not change', () => {
			traversal.moveToKey('1')
			expect(traversal.moveToKey('1')).toBe(false)
		})
	})

	describe('moveToIndex', () => {
		it('should set currentKey based on index', () => {
			expect(traversal.moveToIndex(1)).toBe(true)
			expect(traversal.currentKey).toBe('1')
			expect(traversal.currentIndex).toBe(1)
		})

		it('should return false for out-of-bounds indices', () => {
			expect(traversal.moveToIndex(-1)).toBe(false)
			expect(traversal.moveToIndex(999)).toBe(false)
			expect(traversal.currentKey).toBeNull()
		})

		it('should return false if the index does not change', () => {
			traversal.moveToIndex(1)
			expect(traversal.moveToIndex(1)).toBe(false)
		})
	})

	describe('moveToValue', () => {
		it('should find and focus on item by value', () => {
			const item = mockNodes[1].value
			expect(traversal.moveToValue(item)).toBe(true)
			expect(traversal.currentKey).toBe('1')
		})

		it('should return false if value is not found', () => {
			expect(traversal.moveToValue({ id: 999 })).toBe(false)
			expect(traversal.currentKey).toBeNull()
		})

		it('should clear focus when null is passed', () => {
			traversal.moveToKey('1')
			expect(traversal.moveToValue(null)).toBe(true)
			expect(traversal.currentKey).toBeNull()
		})
	})

	describe('Navigation methods', () => {
		describe('movePrev', () => {
			it('should move to previous item', () => {
				traversal.moveToIndex(2)
				expect(traversal.movePrev()).toBe(true)
				expect(traversal.currentIndex).toBe(1)
			})

			it('should not move before first item', () => {
				traversal.moveToIndex(0)
				expect(traversal.movePrev()).toBe(false)
				expect(traversal.currentIndex).toBe(0)
			})

			it('should move to last item when no focus', () => {
				expect(traversal.movePrev()).toBe(true)
				expect(traversal.currentIndex).toBe(2)
			})
		})

		describe('moveNext', () => {
			it('should move to next item', () => {
				traversal.moveToIndex(0)
				expect(traversal.moveNext()).toBe(true)
				expect(traversal.currentIndex).toBe(1)
			})

			it('should not move past last item', () => {
				traversal.moveToIndex(2)
				expect(traversal.moveNext()).toBe(false)
				expect(traversal.currentIndex).toBe(2)
			})
		})

		describe('moveFirst', () => {
			it('should move to first item', () => {
				traversal.moveToIndex(2)
				expect(traversal.moveFirst()).toBe(true)
				expect(traversal.currentIndex).toBe(0)
			})

			it('should return false for empty list', () => {
				mockDataProvider.nodes = []
				expect(traversal.moveFirst()).toBe(false)
			})
		})

		describe('moveLast', () => {
			it('should move to last item', () => {
				traversal.moveToIndex(0)
				expect(traversal.moveLast()).toBe(true)
				expect(traversal.currentIndex).toBe(2)
			})

			it('should return false for empty list', () => {
				mockDataProvider.nodes = []
				expect(traversal.moveLast()).toBe(false)
			})
		})
	})

	describe('focused', () => {
		it('should return the currently focused item', () => {
			traversal.moveToKey('1')
			expect(traversal.focused).toBe(mockNodes[1].value)
		})

		it('should return null when nothing is focused', () => {
			expect(traversal.focused).toBeNull()
		})
	})
})
