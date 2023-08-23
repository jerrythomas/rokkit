import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { get } from 'svelte/store'

import {
	ViewPort,
	ViewportFactory,
	ResizableViewport,
	FillableViewport,
	virtualListViewport
} from '../../src/lib/viewport'

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
	})
})

// describe('ViewPort', () => {
// 	describe('caching', () => {
// 		const vlm = new ViewPort(20, 400, 40)
// 		it('should initialize', () => {
// 			expect(vlm.index).toBe(-1)
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(-1)
// 			expect(vlm.averageSize).toEqual(40)
// 			expect(vlm.visibleCount).toEqual(1)
// 			expect(vlm.visibleSize).toEqual(400)
// 			expect(vlm.spaceBefore).toEqual(0)
// 			expect(vlm.spaceAfter).toEqual(0)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})

// 		it('should update viewChanged when start or end changes', () => {
// 			vlm.updateStartEnd(0, 10)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			vlm.updateStartEnd(1, 11)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			vlm.updateStartEnd(1, 11)
// 			expect(vlm.viewChanged).toBeFalsy()
// 		})

// 		it('should update cache when count is changed', () => {
// 			vlm.count = null
// 			expect(vlm.viewChanged).toBeFalsy()
// 			vlm.count = 30
// 			expect(vlm.viewChanged).toBeFalsy()
// 			vlm.index = 20
// 			vlm.count = 10
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.index).toEqual(-1)
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(10)
// 		})

// 		it('should update start and end when index changes', () => {
// 			vlm.count = 20
// 			vlm.index = 15
// 			expect(vlm.start).toEqual(6)
// 			expect(vlm.end).toEqual(16)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})

// 		it('should not change index when start or end changes', () => {
// 			vlm.updateStartEnd(0, 10)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.index).toEqual(15)
// 		})

// 		it('should retain original values for start and end when they are null', () => {
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(10)

// 			vlm.updateStartEnd(null, null)
// 			expect(vlm.viewChanged).toBeFalsy()
// 			vlm.updateStartEnd(null, vlm.end)
// 			expect(vlm.viewChanged).toBeFalsy()
// 			vlm.updateStartEnd(vlm.start, null)
// 			expect(vlm.viewChanged).toBeFalsy()

// 			vlm.updateStartEnd(2, null)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(2)
// 			expect(vlm.end).toEqual(12)
// 		})

// 		it('should handle count set to 0 or negative', () => {
// 			vlm.count = 0
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(0)
// 			expect(vlm.index).toEqual(-1)
// 			expect(vlm.visibleCount).toEqual(10)

// 			vlm.index = 0
// 			expect(vlm.index).toEqual(-1)
// 		})
// 	})

// 	describe('sizing', () => {
// 		const vlm = new ViewPort(40, 400, 40)
// 		const elements = mixedSizeElements([
// 			{ count: 5, size: 40 },
// 			{ count: 5, size: 60 },
// 			{ count: 5, size: 30 },
// 			{ count: 5, size: 40 },
// 			{ count: 5, size: 40 }
// 		])

// 		beforeEach(() => {
// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 		})
// 		it('should fit elements within available size', () => {
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(10)

// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.averageSize).toBe((35 * 40 + 5 * 60) / 40)
// 			expect(vlm.visibleCount).toBe(10)
// 			expect(vlm.visibleSize).toEqual(500)
// 			expect(vlm.spaceBefore).toBe(0)
// 			expect(vlm.spaceAfter).toBe(1275)
// 		})

// 		it('should increase visible count when items get smaller', () => {
// 			vlm.updateStartEnd(10, 20)
// 			expect(vlm.start).toEqual(10)
// 			expect(vlm.end).toEqual(20)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(10, 20)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.viewChanged).toBeFalsy()
// 			expect(vlm.averageSize).toBe(42.5)
// 			expect(vlm.visibleCount).toBe(10)
// 			expect(vlm.visibleSize).toEqual(350)
// 			expect(vlm.spaceBefore).toBe(500)
// 			expect(vlm.spaceAfter).toBe(850)
// 		})

// 		it('should decrease visible count when items get bigger', () => {
// 			vlm.updateStartEnd(12, 22)
// 			expect(vlm.start).toEqual(12)
// 			expect(vlm.end).toEqual(22)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(12, 22)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.viewChanged).toBeFalsy()
// 			expect(vlm.visibleCount).toBe(10)
// 			expect(vlm.averageSize).toBe(42.375)
// 			expect(vlm.visibleSize).toEqual(370)
// 			expect(vlm.spaceBefore).toBe(560)
// 			expect(vlm.spaceAfter).toBe(762.75)
// 		})
// 	})

// 	describe('movement', () => {
// 		const vlm = new ViewPort(20, 200, 40)

// 		beforeEach(() => {
// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 		})

// 		it('should move position by offset', () => {
// 			expect(vlm.viewChanged).toBeTruthy()
// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(5)
// 			vlm.moveByOffset(1)
// 			expect(vlm.viewChanged).toBeFalsy()
// 			expect(vlm.index).toEqual(0)
// 			expect(vlm.spaceBefore).toEqual(0)
// 			expect(vlm.visibleSize).toEqual(200)
// 			expect(vlm.spaceAfter).toEqual(600)

// 			vlm.moveByOffset(5)
// 			expect(vlm.index).toEqual(5)
// 			expect(vlm.start).toEqual(1)
// 			expect(vlm.end).toEqual(6)
// 			expect(vlm.spaceBefore).toEqual(40)
// 			expect(vlm.visibleSize).toEqual(200)
// 			expect(vlm.spaceAfter).toEqual(560)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.moveByOffset(16)
// 			expect(vlm.index).toEqual(19)
// 			expect(vlm.start).toEqual(15)
// 			expect(vlm.end).toEqual(20)
// 			expect(vlm.spaceBefore).toEqual(600)
// 			expect(vlm.spaceAfter).toEqual(0)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.moveByOffset(-6)
// 			expect(vlm.index).toEqual(13)
// 			expect(vlm.start).toEqual(13)
// 			expect(vlm.end).toEqual(18)
// 			expect(vlm.spaceBefore).toEqual(520)
// 			expect(vlm.spaceAfter).toEqual(80)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.moveByOffset(-25)
// 			expect(vlm.index).toEqual(0)
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(5)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})

// 		it('should move to next item', () => {
// 			vlm.next()
// 			expect(vlm.index).toEqual(1)
// 			vlm.next()
// 			expect(vlm.index).toEqual(2)
// 			expect(vlm.viewChanged).toBeFalsy()
// 		})
// 		it('should move to previous item', () => {
// 			vlm.previous()
// 			expect(vlm.index).toEqual(1)
// 			vlm.previous()
// 			expect(vlm.index).toEqual(0)
// 			vlm.previous()
// 			expect(vlm.index).toEqual(0)
// 			expect(vlm.viewChanged).toBeFalsy()
// 		})

// 		it('should move to first item', () => {
// 			vlm.first()
// 			expect(vlm.index).toEqual(0)
// 			expect(vlm.viewChanged).toBeFalsy()
// 		})
// 		it('should move to last item', () => {
// 			vlm.last()
// 			expect(vlm.index).toEqual(19)
// 			expect(vlm.start).toEqual(15)
// 			expect(vlm.end).toEqual(20)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})
// 		it('should move to previous page', () => {
// 			vlm.previousPage()
// 			expect(vlm.index).toEqual(14)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(14)
// 			expect(vlm.end).toEqual(19)

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.previousPage()
// 			expect(vlm.index).toEqual(9)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(9)
// 			expect(vlm.end).toEqual(14)

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.previousPage()
// 			expect(vlm.index).toEqual(4)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(4)
// 			expect(vlm.end).toEqual(9)

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.previousPage()
// 			expect(vlm.index).toEqual(0)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(5)
// 		})

// 		it('should move to next page', () => {
// 			vlm.nextPage()
// 			expect(vlm.index).toEqual(5)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.nextPage()
// 			expect(vlm.index).toEqual(10)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.nextPage()
// 			expect(vlm.index).toEqual(15)
// 			expect(vlm.viewChanged).toBeTruthy()

// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 			vlm.nextPage()
// 			expect(vlm.index).toEqual(19)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})
// 	})
// })

// describe('ViewportFactory', () => {
// 	const elements = mixedSizeElements([
// 		{ count: 5, size: 40 },
// 		{ count: 5, size: 60 },
// 		{ count: 5, size: 30 },
// 		{ count: 5, size: 50 }
// 	])
// 	describe('FillableViewport', () => {
// 		const vlm = ViewportFactory(40, 200)

// 		beforeAll(() => {
// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 		})

// 		it('should be a FillableViewport', () => {
// 			expect(vlm).toBeInstanceOf(FillableViewport)
// 			expect(vlm.index).toEqual(-1)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(5)
// 			expect(vlm.averageSize).toBe(40)
// 			vlm.updateStartEnd(5, 10)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 		})

// 		it('should decrease visible count when sizes become bigger', () => {
// 			vlm.updateStartEnd(5, 10)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.averageSize).toBe(44.375)
// 			expect(vlm.visibleCount).toBe(4)
// 			expect(vlm.visibleSize).toEqual(240)
// 			expect(vlm.spaceBefore).toBe(200)
// 			expect(vlm.spaceAfter).toBe(1391.25)
// 		})
// 		it('should increase visible count when items get smaller', () => {
// 			vlm.updateStartEnd(10, 15)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.visibleCount).toBe(7)
// 			expect(vlm.start).toEqual(10)
// 			expect(vlm.end).toEqual(17)
// 			expect(vlm.averageSize).toBe(43.984375)
// 			expect(vlm.visibleSize).toEqual(237.96875)
// 			expect(vlm.spaceBefore).toBe(500)
// 			expect(vlm.spaceAfter).toBe(1011.640625)
// 		})

// 		it('should decrease visible count when items get bigger', () => {
// 			vlm.updateStartEnd(15, 20)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.visibleCount).toBe(5)
// 			expect(vlm.start).toEqual(15)
// 			expect(vlm.end).toEqual(20)
// 			expect(vlm.averageSize).toBe(44.4921875)
// 			expect(vlm.visibleSize).toEqual(250)
// 			expect(vlm.spaceBefore).toBe(650)
// 			expect(vlm.spaceAfter).toBe(889.84375)
// 		})

// 		it('should increase count when availableSize increases', () => {
// 			vlm.availableSize = 400
// 			expect(vlm.visibleSize).toEqual(427.96875)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(15)
// 			expect(vlm.end).toEqual(24)
// 			expect(vlm.index).toEqual(-1)
// 		})

// 		it('should decrease count when availableSize decreases', () => {
// 			vlm.availableSize = 300
// 			expect(vlm.visibleSize).toEqual(338.984375)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(15)
// 			expect(vlm.end).toEqual(22)
// 		})

// 		it('should adjust size even if sizes are not available', () => {
// 			vlm.updateStartEnd(35, 40)

// 			expect(vlm.start).toEqual(33)
// 			expect(vlm.end).toEqual(40)
// 			expect(vlm.visibleSize).toEqual(311.4453125)
// 			expect(vlm.viewChanged).toBeTruthy()
// 		})
// 	})

// 	describe('ResizableViewport', () => {
// 		const vlm = ViewportFactory(40, 400, 5)

// 		beforeEach(() => {
// 			vlm.updateStartEnd(vlm.start, vlm.end)
// 		})

// 		it('should be a ResizableViewport', () => {
// 			expect(vlm).toBeInstanceOf(ResizableViewport)
// 		})

// 		it('should retain fixed size', () => {
// 			expect(vlm.start).toEqual(0)
// 			expect(vlm.end).toEqual(5)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.averageSize).toBe(40)
// 			expect(vlm.visibleCount).toBe(5)
// 			expect(vlm.visibleSize).toEqual(200)
// 			expect(vlm.spaceBefore).toBe(0)
// 			expect(vlm.spaceAfter).toBe(1400)
// 		})

// 		it('should resize when items get bigger', () => {
// 			vlm.updateStartEnd(5, 10)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.averageSize).toBe(42.5)
// 			expect(vlm.visibleCount).toBe(5)
// 			expect(vlm.visibleSize).toEqual(300)
// 			expect(vlm.spaceBefore).toBe(200)
// 			expect(vlm.spaceAfter).toBe(1275)
// 		})

// 		it('should resize when items get smaller', () => {
// 			vlm.updateStartEnd(10, 15)
// 			vlm.updateSizes(elements.slice(vlm.start, vlm.end), 'offsetHeight')
// 			expect(vlm.averageSize).toBe(42.8125)
// 			expect(vlm.visibleCount).toBe(5)
// 			expect(vlm.visibleSize).toEqual(150)
// 			expect(vlm.spaceBefore).toBe(500)
// 			expect(vlm.spaceAfter).toBe(1070.3125)
// 		})

// 		it('should retain size when availableSize changes', () => {
// 			expect(vlm.viewChanged).toBeFalsy()
// 			vlm.availableSize = 400
// 			expect(vlm.visibleSize).toEqual(150)
// 			expect(vlm.viewChanged).toBeFalsy()
// 		})

// 		it('should adjust start when end is beyond limit', () => {
// 			expect(vlm.index).toEqual(-1)
// 			vlm.updateStartEnd(38, 45)
// 			expect(vlm.viewChanged).toBeTruthy()
// 			expect(vlm.start).toEqual(35)
// 			expect(vlm.end).toEqual(40)
// 			expect(vlm.index).toEqual(-1)
// 		})
// 	})
// })
