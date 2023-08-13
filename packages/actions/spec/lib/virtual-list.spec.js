import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { virtualListResizer } from '../../src/lib/virtual-list'

describe('virtualListResizer', () => {
	it('should provide a resize manager', () => {
		const resizer = virtualListResizer()
		expect(resizer).toBeDefined()
		expect(resizer.update).toBeDefined()
		expect(resizer.total).toBeDefined()
		expect(resizer.before).toBeDefined()
		expect(resizer.after).toBeDefined()
		expect(resizer.averageSize).toBeDefined()
		expect(resizer.visibleCount).toBeDefined()
		expect(resizer.visible).toBeDefined()
	})

	it('should increase cache when count increases', () => {
		const resizer = virtualListResizer({ count: 5, availableSize: 800 })
		expect(resizer.visibleCount).toBe(5)
		expect(resizer.visible).toBe(200)
		expect(resizer.total).toBe(200)
		resizer.update({ count: 10 })
		expect(resizer.visibleCount).toBe(10)
		expect(resizer.visible).toBe(400)
		expect(resizer.total).toBe(400)
	})
	it('should decrease cache when count decreases', () => {
		const resizer = virtualListResizer({ count: 10, availableSize: 800 })

		expect(resizer.visibleCount).toBe(10)
		expect(resizer.visible).toBe(400)
		expect(resizer.total).toBe(400)
		resizer.update({ count: 8 })
		expect(resizer.visibleCount).toBe(8)
		expect(resizer.visible).toBe(320)
		expect(resizer.total).toBe(320)
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
			const resizer = virtualListResizer({
				count: 40,
				availableSize: 400
			})
			let start = 0
			let end = 1

			beforeEach(() => {
				end = start + resizer.visibleCount
			})

			it('should fit elements within available size', () => {
				expect(end).toBe(10)
				resizer.update({ elements: elements.slice(start, end) })
				expect(resizer.averageSize).toBe(42.5)
				expect(resizer.visibleCount).toBe(10)
				expect(resizer.visible).toEqual(500)
				expect(resizer.before).toBe(0)
				expect(resizer.after).toBe(1200)
				expect(resizer.total).toBe(1700)
			})

			it('should increase visible count when items get smaller', () => {
				expect(end).toBe(10)
				start += 10
				end += 10
				const visible = elements.slice(start, end)
				resizer.update({ elements: visible, start, end })
				expect(resizer.averageSize).toBe(42.5)
				expect(resizer.visibleCount).toBe(12)
				expect(resizer.visible).toEqual(435)
				expect(resizer.before).toBe(500)
				expect(resizer.after).toBe(765)
				expect(resizer.total).toBe(1700)
			})

			it('should decrease visible count when items get bigger', () => {
				expect(end).toBe(22)
				start += 3
				end += 3
				const visible = elements.slice(start, end)
				resizer.update({ elements: visible, start, end })
				expect(resizer.visibleCount).toBe(11)
				expect(resizer.averageSize).toBe(42.1875)
				expect(resizer.visible).toEqual(420)
				expect(resizer.before).toBe(590)
				expect(resizer.after).toBe(677.5)
				expect(resizer.total).toBe(1687.5)
			})
		})

		describe('maxVisible is defined', () => {
			const resizer = virtualListResizer({
				count: 40,
				maximumVisible: 5,
				availableSize: 400
			})
			let start = 0
			let end = 1

			beforeAll(() => {
				end = start + resizer.visibleCount
			})

			it('should retain fixed size', () => {
				expect(end).toBe(5)
				resizer.update({ elements: elements.slice(start, end) })
				expect(resizer.averageSize).toBe(40)
				expect(resizer.visibleCount).toBe(5)
				expect(resizer.visible).toEqual(200)
				expect(resizer.before).toBe(0)
				expect(resizer.after).toBe(1400)
				expect(resizer.total).toBe(1600)
			})

			it('should resize when items get bigger', () => {
				start += 5
				end += 5
				resizer.update({ elements: elements.slice(start, end), start, end })
				expect(resizer.averageSize).toBe(42.5)
				expect(resizer.visibleCount).toBe(5)
				expect(resizer.visible).toEqual(300)
				expect(resizer.before).toBe(200)
				expect(resizer.after).toBe(1200)
				expect(resizer.total).toBe(1700)
			})

			it('should resize when items get smaller', () => {
				start += 5
				end += 5
				resizer.update({ elements: elements.slice(start, end), start, end })
				expect(resizer.averageSize).toBe(42.8125)
				expect(resizer.visibleCount).toBe(5)
				expect(resizer.visible).toEqual(150)
				expect(resizer.before).toBe(500)
				expect(resizer.after).toBe(1062.5)
				expect(resizer.total).toBe(1712.5)
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
			const resizer = virtualListResizer({
				count: 40,
				availableSize: 500,
				minimumSize: 100,
				horizontal: true
			})
			let start = 0
			let end = start + resizer.visibleCount

			it('should increase visible count when elements become smaller', () => {
				start += 5
				end += 5
				resizer.update({ elements: elements.slice(start, end), start, end })
				expect(resizer.averageSize).toBe(97.5)
				expect(resizer.visibleCount).toBe(6)
				expect(resizer.visible).toEqual(500)
			})
		})

		describe('maxVisible is defined', () => {
			const resizer = virtualListResizer({
				count: 40,
				maximumVisible: 5,
				availableSize: 500,
				minimumSize: 100,
				horizontal: true
			})
			let start = 0
			let end = 1

			beforeAll(() => {
				end = start + resizer.visibleCount
			})

			it('should resize when items get bigger', () => {
				start += 5
				end += 5
				resizer.update({ elements: elements.slice(start, end), start, end })
				expect(resizer.averageSize).toBe(97.5)
				expect(resizer.visibleCount).toBe(5)
				expect(resizer.visible).toEqual(400)
				expect(resizer.before).toBe(500)
				expect(resizer.after).toBe(3000)
				expect(resizer.total).toBe(3900)
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
