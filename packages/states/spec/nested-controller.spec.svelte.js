import { describe, it, expect, beforeEach } from 'vitest'
import { NestedController } from '../src/nested-controller.svelte.js'
import { treeData } from './fixtures/tree.js'
import { clone } from 'ramda'

describe('NestedController', () => {
	let items = $state()
	beforeEach(() => {
		items = clone(treeData)
	})
	describe('constructor', () => {
		it('should initialize', () => {
			const controller = new NestedController(items)
			expect(controller.data.length).toEqual(3)

			expect(controller.focused).toBeFalsy()
			expect(controller.selected).toEqual([])
		})

		it('should initialize with value', () => {
			const controller = new NestedController(items, items[0].children[1].children[0])
			expect(controller.data.length).toEqual(6)
			expect(controller.focused).toEqual(items[0].children[1].children[0])
			expect(controller.selected).toEqual([items[0].children[1].children[0]])
		})
	})

	describe('moveTo', () => {
		it('should move to specified path', () => {
			const controller = new NestedController(items)

			expect(controller.focused).toBeFalsy()
			controller.moveTo(0)
			expect(controller.focused).toEqual(items[0])
		})

		it('should move to second group by key when first group is expanded', () => {
			const controller = new NestedController(items)

			// Expand first group: data = ['0', '0-0', '0-1', '1', '2']
			controller.expand('0')
			expect(controller.data.length).toEqual(5)

			// moveTo('1') should focus Item 2 (second group), not '0-0'
			expect(controller.moveTo('1')).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.focusedKey).toBe('1')
		})

		it('should move to nested child by key', () => {
			const controller = new NestedController(items)

			// Expand first group: data = ['0', '0-0', '0-1', '1', '2']
			controller.expand('0')

			// moveTo('0-1') should focus Item 1.2
			expect(controller.moveTo('0-1')).toBe(true)
			expect(controller.focused).toEqual(items[0].children[1])
			expect(controller.focusedKey).toBe('0-1')
		})

		it('should navigate correctly after moveTo on second group', () => {
			const controller = new NestedController(items)

			// Expand both groups
			controller.expand('0')
			controller.expand('1')
			// data = ['0', '0-0', '0-1', '1', '1-0', '2']

			// Move to second group
			controller.moveTo('1')
			expect(controller.focusedKey).toBe('1')

			// moveNext should go to first child of second group
			controller.moveNext()
			expect(controller.focusedKey).toBe('1-0')
			expect(controller.focused).toEqual(items[1].children[0])
		})

		it('should return false for invalid key', () => {
			const controller = new NestedController(items)
			expect(controller.moveTo('99')).toBe(false)
		})
	})

	describe('expand', () => {
		it('should expand specified path', () => {
			const controller = new NestedController(items)

			expect(controller.data.length).toEqual(3)
			expect(controller.expand('0')).toBe(true)
			expect(controller.data.length).toEqual(5)
			expect(controller.expand('0')).toBe(true)
			expect(controller.data.length).toEqual(5)

			expect(controller.expand()).toBe(false)
			expect(controller.expand('99')).toBe(false)

			expect(controller.moveTo('0')).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.expand()).toBe(true)
		})
	})

	describe('collapse', () => {
		it('should collapse specified path', () => {
			const controller = new NestedController(items)

			expect(controller.data.length).toEqual(3)
			expect(controller.expand('0')).toBe(true)
			expect(controller.data.length).toEqual(5)
			expect(controller.collapse('0')).toBe(true)
			expect(controller.data.length).toEqual(3)

			expect(controller.collapse()).toBe(false)
			expect(controller.collapse('99')).toBe(false)

			expect(controller.moveTo('0')).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.collapse()).toBe(true)
		})
	})
	describe('state isolation', () => {
		it('should not mutate original items on expand/collapse', () => {
			const controller = new NestedController(items)
			expect(controller.expand('0')).toBe(true)
			expect(controller.data.length).toEqual(5)
			// Original item should NOT have _expanded
			expect(items[0]._expanded).toBeUndefined()

			controller.collapse('0')
			expect(controller.data.length).toEqual(3)
			expect(items[0]._expanded).toBeUndefined()
		})
	})

	describe('toggleExpansion', () => {
		it('should toggle expansion of specified path', () => {
			const controller = new NestedController(items)

			expect(controller.data.length).toEqual(3)
			expect(controller.toggleExpansion('0')).toBe(true)
			expect(controller.data.length).toEqual(5)
			expect(controller.toggleExpansion('0')).toBe(true)
			expect(controller.data.length).toEqual(3)

			expect(controller.toggleExpansion()).toBe(false)
			expect(controller.toggleExpansion('99')).toBe(false)

			expect(controller.moveTo('0')).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.toggleExpansion()).toBe(false)
		})
	})
})
