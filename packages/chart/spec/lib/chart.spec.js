import { describe, it, expect } from 'vitest'
import { chart } from '../../src/lib/chart'

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

describe('chart — valueFormat default', () => {
	it('falls back to an identity formatter when none is supplied', () => {
		// The default is what every chart without an explicit `valueFormat` uses to
		// render labels, so it has to be the identity rather than, say, String().
		const c = chart([{ x: 'a', y: 1 }], { x: 'x', y: 'y' })

		expect(c.valueFormat).toBeTypeOf('function')
		expect(c.valueFormat(42)).toBe(42)
		expect(c.valueFormat('kept')).toBe('kept')
		expect(c.valueFormat(null)).toBeNull()
	})

	it('uses a supplied formatter instead', () => {
		const c = chart([{ x: 'a', y: 1 }], { x: 'x', y: 'y', valueFormat: (d) => `${d}%` })

		expect(c.valueFormat(42)).toBe('42%')
	})
})
