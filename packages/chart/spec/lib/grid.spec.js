import { describe, it, expect } from 'vitest'
import { swatchGrid } from '../../src/lib/grid'

describe('swatchGrid', () => {
	it('should return a swatchGrid', () => {
		const grid = swatchGrid(4, 10)
		expect(grid).toEqual({
			data: [
				{
					r: 5,
					x: 5,
					y: 5
				},
				{
					r: 5,
					x: 15,
					y: 5
				},
				{
					r: 5,
					x: 5,
					y: 15
				},
				{
					r: 5,
					x: 15,
					y: 15
				}
			],
			height: 20,
			width: 20
		})
	})
})
