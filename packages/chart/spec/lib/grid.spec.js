import { describe, it, expect } from 'vitest'
import { swatchGrid } from '../../src/old_lib/grid'

describe('swatchGrid', () => {
	it('should return a swatchGrid', () => {
		const grid = swatchGrid(4, 10)
		expect(grid).toEqual({
			data: [
				{ r: 5, x: 5, y: 5 },
				{ r: 5, x: 15, y: 5 },
				{ r: 5, x: 5, y: 15 },
				{ r: 5, x: 15, y: 15 }
			],
			height: 20,
			width: 20
		})
	})

	it('should return a swatchGrid with padding', () => {
		const grid = swatchGrid(4, 10, { pad: 5 })
		expect(grid).toEqual({
			data: [
				{ r: 5, x: 10, y: 10 },
				{ r: 5, x: 25, y: 10 },
				{ r: 5, x: 10, y: 25 },
				{ r: 5, x: 25, y: 25 }
			],
			height: 35,
			width: 35
		})
	})

	it('should return a swatchGrid with fixed columns', () => {
		const grid = swatchGrid(4, 10, { columns: 3 })
		expect(grid).toEqual({
			data: [
				{ r: 5, x: 5, y: 5 },
				{ r: 5, x: 15, y: 5 },
				{ r: 5, x: 25, y: 5 },
				{ r: 5, x: 5, y: 15 }
			],
			height: 20,
			width: 30
		})
	})

	it('should return a swatchGrid with fixed rows', () => {
		const grid = swatchGrid(4, 10, { rows: 3 })
		expect(grid).toEqual({
			data: [
				{ r: 5, x: 5, y: 5 },
				{ r: 5, x: 15, y: 5 },
				{ r: 5, x: 5, y: 15 },
				{ r: 5, x: 15, y: 15 }
			],
			height: 30,
			width: 20
		})
	})
})
