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
	})
})
