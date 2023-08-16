import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { virtualListManager } from '../../src/lib/virtual-list'

describe('virtualListManager', () => {
	// describe('cache size', () => {
	// 	it('should provide a resize manager', () => {
	// 		const vlm = virtualListManager()
	// 		expect(vlm).toBeDefined()
	// 		expect(vlm.update).toBeDefined()
	// 		expect(vlm.totalSize).toBeDefined()
	// 		expect(vlm.spaceBefore).toBeDefined()
	// 		expect(vlm.spaceAfter).toBeDefined()
	// 		expect(vlm.averageSize).toBeDefined()
	// 		expect(vlm.visibleCount).toBeDefined()
	// 		expect(vlm.visibleSize).toBeDefined()
	// 	})

	// 	it('should increase cache when count increases', () => {
	// 		const vlm = virtualListManager({ count: 5, availableSize: 800 })
	// 		expect(vlm.visibleCount).toBe(5)
	// 		expect(vlm.visibleSize).toBe(200)
	// 		expect(vlm.totalSize).toBe(200)
	// 		vlm.update({ count: 10 })
	// 		expect(vlm.visibleCount).toBe(10)
	// 		expect(vlm.visibleSize).toBe(400)
	// 		expect(vlm.totalSize).toBe(400)
	// 	})

	// 	it('should decrease cache when count decreases', () => {
	// 		const vlm = virtualListManager({ count: 10, availableSize: 800 })

	// 		expect(vlm.visibleCount).toBe(10)
	// 		expect(vlm.visibleSize).toBe(400)
	// 		expect(vlm.totalSize).toBe(400)
	// 		vlm.update({ count: 8 })
	// 		expect(vlm.visibleCount).toBe(8)
	// 		expect(vlm.visibleSize).toBe(320)
	// 		expect(vlm.totalSize).toBe(320)
	// 	})
	// })
	describe('movement', () => {
		it('should move position by offset', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toBe(-1)

			vlm.moveByOffset(1)
			expect(vlm.index).toEqual(0)
			expect(vlm.start).toEqual(0)
			expect(vlm.end).toEqual(5)
			expect(vlm.delta).toEqual(1)
			expect(vlm.spaceBefore).toEqual(0)
			expect(vlm.visibleSize).toEqual(200)
			expect(vlm.spaceAfter).toEqual(600)

			vlm.moveByOffset(5)
			expect(vlm.index).toEqual(5)
			expect(vlm.start).toEqual(5)
			expect(vlm.end).toEqual(10)
			expect(vlm.spaceBefore).toEqual(200)
			expect(vlm.visibleSize).toEqual(200)
			expect(vlm.spaceAfter).toEqual(400)

			vlm.moveByOffset(16)
			expect(vlm.index).toEqual(19)
			expect(vlm.start).toEqual(15)
			expect(vlm.end).toEqual(20)
			expect(vlm.spaceBefore).toEqual(600)
			expect(vlm.spaceAfter).toEqual(0)

			vlm.moveByOffset(-6)
			expect(vlm.index).toEqual(13)
			expect(vlm.start).toEqual(9)
			expect(vlm.end).toEqual(14)
			expect(vlm.spaceBefore).toEqual(360)
			expect(vlm.spaceAfter).toEqual(240)

			vlm.moveByOffset(-25)
			expect(vlm.index).toEqual(0)
			expect(vlm.start).toEqual(0)
			expect(vlm.end).toEqual(5)
		})

		it('should move to next item', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.next()
			expect(vlm.index).toEqual(0)
			vlm.next()
			expect(vlm.index).toEqual(1)
		})

		it('should move to previous item', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.previous()
			expect(vlm.index).toEqual(0)
			vlm.next()
			expect(vlm.index).toEqual(1)
			vlm.previous()
			expect(vlm.index).toEqual(0)
		})

		it('should move to first item', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.first()
			expect(vlm.index).toEqual(0)
		})

		it('should move to last item', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.last()
			expect(vlm.index).toEqual(19)
		})

		it('should move to next page', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.nextPage()
			expect(vlm.index).toEqual(4)
			vlm.nextPage()
			expect(vlm.index).toEqual(9)
			vlm.nextPage()
			expect(vlm.index).toEqual(14)
			vlm.nextPage()
			expect(vlm.index).toEqual(19)
		})

		it('should move to previous page', () => {
			const vlm = virtualListManager({ count: 20, maxVisible: 5 })
			expect(vlm.index).toEqual(-1)
			vlm.last()
			expect(vlm.index).toEqual(19)
			vlm.previousPage()
			expect(vlm.index).toEqual(14)
			vlm.previousPage()
			expect(vlm.index).toEqual(9)
			vlm.previousPage()
			expect(vlm.index).toEqual(4)
			vlm.previousPage()
			expect(vlm.index).toEqual(0)
		})
	})

	describe('vertical', () => {
		const elements = mixedSizeElements([
			{ count: 5, size: 40 },
			{ count: 5, size: 60 },
			{ count: 5, size: 30 },
			{ count: 5, size: 40 },
			{ count: 5, size: 40 }
		])

		describe('maxVisible is null', () => {
			const vlm = virtualListManager({
				count: 40,
				availableSize: 400
			})
			let start = 0
			let end = 1

			beforeEach(() => {
				end = start + vlm.visibleCount
			})

			it('should fit elements within available size', () => {
				expect(end).toBe(10)
				vlm.update({ elements: elements.slice(start, end) })
				expect(vlm.averageSize).toBe((35 * 40 + 5 * 60) / 40)
				expect(vlm.visibleCount).toBe(10)
				expect(vlm.visibleSize).toEqual(500)
				expect(vlm.spaceBefore).toBe(0)
				expect(vlm.spaceAfter).toBe(1275)
				expect(vlm.totalSize).toBe(1775)
			})

			it('should increase visible count when items get smaller', () => {
				expect(end).toBe(10)
				start += 10
				end += 10
				const visible = elements.slice(start, end)
				vlm.update({ elements: visible, start, end })
				expect(vlm.averageSize).toBe(42.5)
				expect(vlm.visibleCount).toBe(12)
				expect(vlm.visibleSize).toEqual(435)
				expect(vlm.spaceBefore).toBe(500)
				expect(vlm.spaceAfter).toBe(765)
				expect(vlm.totalSize).toBe(1700)
			})

			it('should decrease visible count when items get bigger', () => {
				expect(end).toBe(22)
				start += 3
				end += 3
				const visible = elements.slice(start, end)
				vlm.update({ elements: visible, start, end })
				expect(vlm.visibleCount).toBe(11)
				expect(vlm.averageSize).toBe(42.1875)
				expect(vlm.visibleSize).toEqual(420)
				expect(vlm.spaceBefore).toBe(590)
				expect(vlm.spaceAfter).toBe(672.8125)
				expect(vlm.totalSize).toBe(1682.8125)
			})
		})

		describe('maxVisible is defined', () => {
			const vlm = virtualListManager({
				count: 40,
				maxVisible: 5,
				availableSize: 400
			})
			let start = 0
			let end = 1

			beforeAll(() => {
				end = start + vlm.visibleCount
			})

			it('should retain fixed size', () => {
				expect(end).toBe(5)
				vlm.update({ elements: elements.slice(start, end) })
				expect(vlm.averageSize).toBe(40)
				expect(vlm.visibleCount).toBe(5)
				expect(vlm.visibleSize).toEqual(200)
				expect(vlm.spaceBefore).toBe(0)
				expect(vlm.spaceAfter).toBe(1400)
				expect(vlm.totalSize).toBe(1600)
			})

			it('should resize when items get bigger', () => {
				start += 5
				end += 5
				vlm.update({ elements: elements.slice(start, end), start, end })
				expect(vlm.averageSize).toBe(42.5)
				expect(vlm.visibleCount).toBe(5)
				expect(vlm.visibleSize).toEqual(300)
				expect(vlm.spaceBefore).toBe(200)
				expect(vlm.spaceAfter).toBe(1275)
				expect(vlm.totalSize).toBe(1775)
			})

			it('should resize when items get smaller', () => {
				start += 5
				end += 5
				vlm.update({ elements: elements.slice(start, end), start, end })
				expect(vlm.averageSize).toBe(42.8125)
				expect(vlm.visibleCount).toBe(5)
				expect(vlm.visibleSize).toEqual(150)
				expect(vlm.spaceBefore).toBe(500)
				expect(vlm.spaceAfter).toBe(1070.3125)
				expect(vlm.totalSize).toBe(1720.3125)
			})
		})
	})

	describe('horizontal', () => {
		const elements = mixedSizeElements(
			[
				{ count: 5, size: 100 },
				{ count: 5, size: 80 },
				{ count: 5, size: 120 },
				{ count: 5, size: 100 },
				{ count: 5, size: 100 }
			],
			'offsetWidth'
		)

		describe('maxVisible is null', () => {
			const vlm = virtualListManager({
				count: 40,
				availableSize: 500,
				minimumSize: 100,
				horizontal: true
			})
			let start = 0
			let end = start + vlm.visibleCount

			it('should increase visible count when elements become smaller', () => {
				start += 5
				end += 5
				vlm.update({ elements: elements.slice(start, end), start, end })
				expect(vlm.averageSize).toBe(97.5)
				expect(vlm.visibleCount).toBe(7)
				expect(vlm.visibleSize).toEqual(595)
			})
		})

		describe('maxVisible is defined', () => {
			const vlm = virtualListManager({
				count: 40,
				maxVisible: 5,
				availableSize: 500,
				minimumSize: 100,
				horizontal: true
			})
			let start = 0
			let end = 1

			beforeAll(() => {
				end = start + vlm.visibleCount
			})

			it('should resize when items get bigger', () => {
				start += 5
				end += 5
				vlm.update({ elements: elements.slice(start, end), start, end })
				expect(vlm.averageSize).toBe(97.5)
				expect(vlm.visibleCount).toBe(5)
				expect(vlm.visibleSize).toEqual(400)
				expect(vlm.spaceBefore).toBe(487.5)
				expect(vlm.spaceAfter).toBe(2925)
				expect(vlm.totalSize).toBe(3812.5)
			})
		})
	})
})

function mixedSizeElements(data, prop) {
	return data.reduce(
		(elements, { count, size }) => [
			...elements,
			...elementsWithSize(count, size, prop)
		],
		[]
	)
}

function elementsWithSize(count, size, prop = 'offsetHeight') {
	return Array.from({ length: count }, () => ({
		[prop]: size
	}))
}
