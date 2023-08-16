import { describe, it, expect } from 'vitest'
import { SizeManager } from '../../src/lib/size-manager'

describe('SizeManager', () => {
	it('should return an instance of SizeManager', () => {
		const sizeManager = new SizeManager(10)
		expect(sizeManager).toBeInstanceOf(SizeManager)
		expect(sizeManager).toHaveProperty('sizes')
		expect(sizeManager.updateAverage).toBeInstanceOf(Function)
		expect(sizeManager.calculateSum).toBeInstanceOf(Function)
	})

	it('should update the average size', () => {
		const elements = [
			{ offsetWidth: 10 },
			{ offsetWidth: 20 },
			{ offsetWidth: 30 }
		]
		const sizeManager = new SizeManager(10)
		expect(sizeManager.averageSize).toBe(40)
		sizeManager.updateSizes(elements, 'offsetWidth', 2)
		expect(sizeManager.averageSize).toBe(34)
	})

	it('should calculate the sum of the sizes', () => {
		const elements = [
			{ offsetWidth: 10 },
			{ offsetWidth: 20 },
			{ offsetWidth: 30 }
		]
		const sizeManager = new SizeManager(10)
		expect(sizeManager.calculateSum(0, 4)).toBe(160)
		sizeManager.updateSizes(elements, 'offsetWidth', 0)
		expect(sizeManager.calculateSum(0, 4)).toBe(94)
		sizeManager.updateSizes(elements, 'offsetWidth', 8)
		expect(sizeManager.calculateSum(8, 10)).toBe(30)
	})

	it('should adjust cache when count increases', () => {
		const sizeManager = new SizeManager(10, 50)
		sizeManager.updateSizes([{ offsetWidth: 10 }], 'offsetWidth', 0)
		expect(sizeManager.averageSize).toBe(46)
		sizeManager.updateCount(20)
		expect(sizeManager.averageSize).toBe((19 * 46 + 10) / 20)
	})

	it('should reset cache when count decreases', () => {
		const sizeManager = new SizeManager(10, 50)
		sizeManager.updateSizes([{ offsetWidth: 10 }], 'offsetWidth', 0)
		expect(sizeManager.averageSize).toBe(46)
		sizeManager.updateCount(5)
		expect(sizeManager.averageSize).toBe(50)
	})

	it('should not change cache when count does not change', () => {
		const sizeManager = new SizeManager(10, 50)
		sizeManager.updateSizes([{ offsetWidth: 10 }], 'offsetWidth', 0)
		expect(sizeManager.averageSize).toBe(46)
		sizeManager.updateCount(10)
		expect(sizeManager.averageSize).toBe(46)
		sizeManager.updateCount()
		expect(sizeManager.averageSize).toBe(46)
	})

	it('should return average as 0 when count is 0', () => {
		const sizeManager = new SizeManager(0, 50)
		sizeManager.updateAverage()
		expect(sizeManager.averageSize).toBe(0)
	})
})
