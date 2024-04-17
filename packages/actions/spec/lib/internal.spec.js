import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toHaveBeenDispatchedWith } from 'validators'
import {
	mapKeyboardEventsToActions,
	getClosestAncestorWithAttribute,
	handleItemClick,
	updateSizes,
	calculateSum,
	fitIndexInViewport,
	fixViewportForVisibileCount
} from '../../src/lib/internal'

expect.extend({ toHaveBeenDispatchedWith })
describe('internal', () => {
	const handlers = {
		next: vi.fn(),
		previous: vi.fn(),
		select: vi.fn(),
		escape: vi.fn(),
		collapse: vi.fn(),
		expand: vi.fn()
	}

	describe('mapKeyboardEventsToActions', () => {
		describe('vertical', () => {
			it('should map keyboard events to actions', () => {
				const actions = mapKeyboardEventsToActions(handlers)
				expect(actions).toEqual({
					ArrowDown: handlers.next,
					ArrowUp: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
			it('should map keyboard events to actions for nested', () => {
				const actions = mapKeyboardEventsToActions(handlers, { nested: true })
				expect(actions).toEqual({
					ArrowDown: handlers.next,
					ArrowUp: handlers.previous,
					ArrowRight: handlers.expand,
					ArrowLeft: handlers.collapse,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
		})

		describe('horizontal', () => {
			it('should map keyboard events to actions', () => {
				const actions = mapKeyboardEventsToActions(handlers, {
					horizontal: true
				})
				expect(actions).toEqual({
					ArrowRight: handlers.next,
					ArrowLeft: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
			it('should map keyboard events to actions for nested', () => {
				const actions = mapKeyboardEventsToActions(handlers, {
					horizontal: true,
					nested: true
				})
				expect(actions).toEqual({
					ArrowDown: handlers.expand,
					ArrowUp: handlers.collapse,
					ArrowRight: handlers.next,
					ArrowLeft: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
		})
	})

	describe('getClosestAncestorWithAttribute', () => {
		it('should return null if element does not have the given attribute and is orphan', () => {
			const element = document.createElement('div')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(null)
		})
		it('should return the element if it has the given attribute', () => {
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the element if it has the given attribute and is nested', () => {
			const parent = document.createElement('div')
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the closest ancestor if it has the given attribute', () => {
			const element = document.createElement('div')
			const parent = document.createElement('div')
			parent.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(parent)
		})
	})

	describe('handleItemClick', () => {
		const element = document.createElement('div')
		const events = ['collapse', 'expand', 'select']
		const handlers = {}

		beforeEach(() => {
			events.forEach((event) => {
				handlers[event] = vi.fn()
				element.addEventListener(event, handlers[event])
			})
		})

		afterEach(() => vi.resetAllMocks())

		it('should emit "collapse" event and close the item if the item has children and is open', () => {
			const current = {
				item: { nodes: [{ id: 2 }], isOpen: true },
				fields: { children: 'nodes', isOpen: 'isOpen' },
				position: [0]
			}
			const result = handleItemClick(element, current)
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				item: current.item,
				position: current.position
			})
			expect(result.item.isOpen).toBeFalsy()
		})

		it('should emit "expand" event and open the item if the item has children and is not open', () => {
			const current = {
				item: { nodes: [{ id: 2 }] },
				fields: { children: 'nodes', isOpen: 'isOpen' },
				position: [0]
			}
			const result = handleItemClick(element, current)
			expect(handlers.expand).toHaveBeenDispatchedWith({
				item: current.item,
				position: current.position
			})
			expect(result.item.isOpen).toBeTruthy()
		})

		it('should emit "select" event if the item does not have children', () => {
			const current = {
				item: { id: 1 },
				fields: { children: 'nodes', isOpen: 'isOpen' },
				position: [0]
			}
			const result = handleItemClick(element, current)
			expect(handlers.select).toHaveBeenDispatchedWith({
				item: current.item,
				position: current.position
			})
			expect(result).toEqual(current)
		})
	})

	describe('updateSizes', () => {
		it('should update sizes using values provided', () => {
			let result = updateSizes([0], [])
			expect(result).toEqual([0])

			result = updateSizes([0, 0, 0, 0, 0], [1, 1])
			expect(result).toEqual([1, 1, 0, 0, 0])

			result = updateSizes([0, 0, 0, 0, 0], [1, 1], 2)
			expect(result).toEqual([0, 0, 1, 1, 0])
			result = updateSizes([0, 0, 0, 0, 0], [1, 1], 4)
			expect(result).toEqual([0, 0, 0, 0, 1, 1])
		})
	})

	describe('calculateSum', () => {
		it('should calculate sum of a slice', () => {
			const sizes = [20, 20, 30, 30, null, null, null]
			expect(calculateSum(sizes, 0, 2)).toEqual(40)
			expect(calculateSum(sizes, 2, 4)).toEqual(60)
			expect(calculateSum(sizes, 4, 7)).toEqual(120)
			expect(calculateSum(sizes, 4, 7, 20)).toEqual(60)
		})
	})
	describe('fitIndexInViewport', () => {
		const visibleCount = 5
		it('should fit the bounds to include index', () => {
			const bounds = { lower: 0, upper: 5 }
			let result = fitIndexInViewport(10, bounds, visibleCount)
			expect(result).toEqual({ lower: 6, upper: 11 })
			result = fitIndexInViewport(9, result, visibleCount)
			expect(result).toEqual({ lower: 6, upper: 11 })
			result = fitIndexInViewport(6, result, visibleCount)
			expect(result).toEqual({ lower: 6, upper: 11 })
			result = fitIndexInViewport(5, result, visibleCount)
			expect(result).toEqual({ lower: 5, upper: 10 })
		})
	})

	describe('fixViewportForVisibileCount', () => {
		it('should adjust the viewport based on visibleCount', () => {
			let result = fixViewportForVisibileCount({ lower: 0, upper: 5 }, 20, 5)
			expect(result).toEqual({ lower: 0, upper: 5 })
			result = fixViewportForVisibileCount({ lower: 0, upper: 3 }, 20, 5)
			expect(result).toEqual({ lower: 0, upper: 5 })
			result = fixViewportForVisibileCount({ lower: 17, upper: 3 }, 20, 5)
			expect(result).toEqual({ lower: 15, upper: 20 })
			result = fixViewportForVisibileCount({ lower: 10, upper: 16 }, 20, 5)
			expect(result).toEqual({ lower: 10, upper: 15 })
		})
	})
})
