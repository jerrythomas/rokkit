import { describe, it, expect } from 'vitest'
import { chart } from '../../src/old_lib/chart'

describe('swatchGrid', () => {
	const data = [
		{ x: 0, y: 0, color: 'red' },
		{ x: 10, y: 0, color: 'green' },
		{ x: 20, y: 0, color: 'blue' },
		{ x: 30, y: 0, color: 'yellow' }
	]
	it('should return a swatchGrid', () => {
		const chartData = chart(data, { x: 'x', y: 'y', color: 'color' })
		expect(chartData.data).toEqual(data)
	})
})
