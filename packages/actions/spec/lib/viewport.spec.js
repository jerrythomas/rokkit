import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'

import { virtualListViewport } from '../../src/lib/viewport'

describe('viewport', () => {
	const items = Array.from({ length: 20 }, (_, k) => k)

	describe('fixed count', () => {
		const viewport = virtualListViewport({
			items,
			sizes: [],
			start: 0,
			end: 0,
			maxVisible: 5,
			value: null
		})
		it('should initialize', () => {
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 5 })
			expect(get(viewport.space)).toEqual({
				before: 0,
				visible: 200,
				after: 600
			})
		})
		it('should update the bounds when they are updated', () => {
			viewport.update({
				items,
				sizes: [],
				start: 3,
				end: 8,
				maxVisible: 5
			})
			expect(get(viewport.bounds)).toEqual({ lower: 3, upper: 8 })
			viewport.update({
				items,
				sizes: [],
				start: 3,
				end: 6,
				maxVisible: 5
			})
			expect(get(viewport.bounds)).toEqual({ lower: 3, upper: 8 })
			viewport.update({
				items,
				sizes: [],
				start: 18,
				end: 23,
				maxVisible: 5
			})
			expect(get(viewport.bounds)).toEqual({ lower: 15, upper: 20 })
			viewport.update({
				items,
				sizes: [],
				start: -1,
				end: 3,
				maxVisible: 5
			})
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 5 })
		})
		it('should update the bounds when value changes', () => {
			viewport.update({
				items,
				sizes: [],
				start: 0,
				end: 5,
				maxVisible: 5,
				value: items[6]
			})
			expect(get(viewport.bounds)).toEqual({ lower: 2, upper: 7 })
			viewport.update({
				items,
				sizes: [],
				start: 2,
				end: 7,
				maxVisible: 5,
				value: items[1]
			})
			expect(get(viewport.bounds)).toEqual({ lower: 1, upper: 6 })
		})
	})

	describe('fixed size', () => {
		it('should initialize', () => {
			const viewport = virtualListViewport({
				items,
				sizes: [],
				start: 0,
				end: 0,
				visibleSize: 300
			})
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
			expect(get(viewport.space)).toEqual({
				before: 0,
				after: 12 * 40
			})
		})

		it('should increase visible count when items get smaller', () => {
			const viewport = virtualListViewport({
				items,
				sizes: [10, 10, 10, 20, 20, 20],
				start: 0,
				end: 0,
				visibleSize: 300
			})
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 10 })
		})
		it('should decrease visible count when items get bigger', () => {
			const viewport = virtualListViewport({
				items,
				sizes: [],
				start: 0,
				end: 0,
				visibleSize: 300
			})
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
			viewport.update({ sizes: [80, 80, 80, 80, 80, 80] })
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 7 })
		})
	})

	describe('movement', () => {
		const viewport = virtualListViewport({
			items,
			sizes: [],
			start: 0,
			end: 0,
			visibleSize: 300
		})

		it('should move by offset', () => {
			viewport.moveByOffset(1)
			expect(viewport.index).toEqual(0)
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
			viewport.moveByOffset(9)
			expect(viewport.index).toEqual(9)
			expect(get(viewport.bounds)).toEqual({ lower: 2, upper: 10 })
			viewport.moveByOffset(-1)
			expect(viewport.index).toEqual(8)
			expect(get(viewport.bounds)).toEqual({ lower: 2, upper: 10 })
			viewport.moveByOffset(-10)
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
		})

		it('should adjust position when scrolling to value', () => {
			viewport.scrollTo(90)
			expect(viewport.index).toEqual(0)
			expect(get(viewport.bounds)).toEqual({ lower: 2, upper: 10 })

			viewport.scrollTo(95)
			expect(viewport.index).toEqual(0)
			expect(get(viewport.bounds)).toEqual({ lower: 2, upper: 10 })
		})

		it('should handle when count drops to 0', () => {
			viewport.update({ items: [] })
			expect(viewport.index).toEqual(-1)
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 0 })
			viewport.update({ items })
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
		})

		it('should move to next item', () => {
			viewport.next()
			expect(viewport.index).toEqual(0)
			viewport.next()
			expect(viewport.index).toEqual(1)
		})

		it('should move to previous item', () => {
			viewport.previous()
			expect(viewport.index).toEqual(0)
			viewport.previous()
			expect(viewport.index).toEqual(0)
		})

		it('should move to next page', () => {
			viewport.nextPage()
			expect(viewport.index).toEqual(8)
			expect(get(viewport.bounds)).toEqual({ lower: 1, upper: 9 })
			viewport.nextPage()
			expect(viewport.index).toEqual(16)
			expect(get(viewport.bounds)).toEqual({ lower: 9, upper: 17 })
		})

		it('should move to previous page', () => {
			viewport.previousPage()
			expect(viewport.index).toEqual(8)
			expect(get(viewport.bounds)).toEqual({ lower: 8, upper: 16 })
			viewport.previousPage()
			expect(viewport.index).toEqual(0)
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
		})

		it('should move to last item', () => {
			viewport.last()
			expect(viewport.index).toEqual(19)
			expect(get(viewport.bounds)).toEqual({ lower: 12, upper: 20 })
		})

		it('should move to first item', () => {
			viewport.first()
			expect(viewport.index).toEqual(0)
			expect(get(viewport.bounds)).toEqual({ lower: 0, upper: 8 })
		})
	})
})
