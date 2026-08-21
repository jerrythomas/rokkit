import { describe, it, expect } from 'vitest'
import { buildSelectDetail } from '../../src/lib/select.js'

describe('buildSelectDetail', () => {
	const row = { day: 3, v: 9, product: 'Pro' }
	const ev = { type: 'click' }
	it('assembles a rich detail from a row + channels', () => {
		const d = buildSelectDetail({ datum: row, index: 2, channels: { x: 'day', y: 'v' }, geom: 'line', series: 'Pro', event: ev })
		expect(d).toEqual({
			datum: row, index: 2, series: 'Pro', value: 9, x: 3, y: 9, geom: 'line', event: ev
		})
	})
	it('series/x/y are undefined when not provided', () => {
		const d = buildSelectDetail({ datum: row, index: 0, channels: { y: 'v' }, geom: 'bar', series: undefined, event: ev })
		expect(d.series).toBeUndefined()
		expect(d.x).toBeUndefined()
		expect(d.value).toBe(9)
		expect(d.y).toBe(9)
	})
	it('value/y are undefined when y channel is missing', () => {
		const d = buildSelectDetail({ datum: row, index: 0, channels: { x: 'day' }, geom: 'point', series: 'Pro', event: ev })
		expect(d.x).toBe(3)
		expect(d.value).toBeUndefined()
		expect(d.y).toBeUndefined()
	})
})
