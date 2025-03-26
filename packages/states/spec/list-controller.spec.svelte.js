import { describe, it, expect, beforeEach } from 'vitest'
import { ListController } from '../src/list-controller.svelte.js'

describe('ListController', () => {
	const textArray = ['Alpha', 'Beta', 'Gamma']
	const objectArray = [{ text: 'Alpha' }, { text: 'Beta' }, { text: 'Gamma' }]

	const items = $state(objectArray)

	describe('constructor', () => {
		it('should initialize with string array', () => {
			const items = $state(textArray)
			const controller = new ListController(items)
			expect(controller.isNested).toEqual(false)
			expect(controller.focused).toBeFalsy()
			expect(Array.from(controller.selected)).toEqual([])
		})

		it('should initialize with string array and value', () => {
			const items = $state(['Alpha', 'Beta', 'Gamma'])
			const controller = new ListController(items, items[1])
			expect(controller.focused).toEqual(items[1])
			expect(Array.from(controller.selected)).toEqual([items[1]])
		})

		it('should initialize with object array', () => {
			const controller = new ListController(items)
			expect(controller.focused).toBeFalsy()
			expect(Array.from(controller.selected)).toEqual([])
		})

		it('should initialize with object array and value', () => {
			const controller = new ListController(items, items[1])
			expect(controller.focused).toEqual(items[1])
			expect(Array.from(controller.selected)).toEqual([items[1]])
		})
	})

	describe('moveToValue', () => {
		it('should move to node with matching value', () => {
			const proxy = new ListController(items)
			expect(proxy.focused).toBeFalsy()
			expect(proxy.moveToValue(items[0])).toBe(true)

			expect(proxy.focused).toEqual(items[0])
			expect(proxy.selected).toEqual([items[0]])

			expect(proxy.moveToValue(items[0])).toBe(true)
			expect(proxy.moveToValue(items[1])).toBe(true)
			expect(proxy.focused).toEqual(items[1])

			expect(proxy.moveToValue(null)).toBe(true)
			expect(proxy.focused).toBeFalsy()
			expect(proxy.selected).toEqual([])
		})
	})

	describe('traversal', () => {
		let controller = null
		beforeEach(() => {
			controller = new ListController(items)
		})

		it('should not move if path is not provided', () => {
			expect(controller.moveTo()).toBe(false)
		})

		it('should to path string', () => {
			expect(controller.moveTo('1')).toBe(true)
			expect(controller.focused).toEqual(items[1])
		})

		it('should move to next sibling if available', () => {
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.moveNext()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.moveNext()).toBe(false)
		})

		it('should move to previous sibling if available', () => {
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.movePrev()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.movePrev()).toBe(false)
		})

		it('should move to first node', () => {
			expect(controller.moveFirst()).toBe(true)
			expect(controller.focused).toEqual(items[0])
			expect(controller.moveFirst()).toBe(false)
		})

		it('should move to last node', () => {
			expect(controller.moveLast()).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.moveLast()).toBe(false)
		})
	})

	describe('selection', () => {
		let controller = null

		beforeEach(() => {
			controller = new ListController(items)
		})

		it('should select item by path', () => {
			expect(controller.select('1')).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[1]])

			expect(controller.select('2')).toBe(true)
			expect(controller.focused).toEqual(items[2])
			expect(controller.selected).toEqual([items[2]])

			expect(controller.select('5')).toBe(false)

			controller.movePrev()
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[2]])

			expect(controller.select()).toBe(true)
			expect(controller.focused).toEqual(items[1])
			expect(controller.selected).toEqual([items[1]])
		})

		it('should extend selection in multiselect mode', () => {
			const multi = new ListController(items, null, {}, { multiselect: true })
			expect(multi.extendSelection('1')).toBe(true)
			expect(multi.selected).toEqual([items[1]])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([items[1], items[0]])
			expect(multi.extendSelection('1')).toBe(true)
			expect(multi.selected).toEqual([items[0]])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([])
			expect(multi.extendSelection('0')).toBe(true)
			expect(multi.selected).toEqual([items[0]])
			expect(multi.extendSelection()).toBe(false)
			expect(multi.extendSelection('99')).toBe(false)
			expect(multi.selected).toEqual([items[0]])
		})
	})
})
