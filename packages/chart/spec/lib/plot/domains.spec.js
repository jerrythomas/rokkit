import { describe, it, expect } from 'vitest'
import {
	sortedBandDomain,
	boxDomain,
	stackDomain,
	waterfallDomain,
	resolveValueDomain
} from '../../../src/lib/plot/domains.js'

describe('sortedBandDomain', () => {
	const rows = [
		{ q: 'a', v: 1 },
		{ q: 'b', v: 5 },
		{ q: 'a', v: 1 },
		{ q: 'c', v: 3 }
	]
	it('orders categories by summed value, desc or asc', () => {
		expect(sortedBandDomain([rows], 'q', 'v', 'desc')).toEqual(['b', 'c', 'a'])
		expect(sortedBandDomain([rows], 'q', 'v', 'asc')).toEqual(['a', 'c', 'b'])
	})
	it('is null when not sorting or a channel is missing', () => {
		expect(sortedBandDomain([rows], 'q', 'v', undefined)).toBeNull()
		expect(sortedBandDomain([rows], undefined, 'v', 'desc')).toBeNull()
	})
})

describe('boxDomain', () => {
	it('spans the whiskers and every outlier', () => {
		const rows = [
			{ iqr_min: 2, iqr_max: 8, outliers: [15] },
			{ iqr_min: 1, iqr_max: 9, outliers: [-3, NaN] }
		]
		expect(boxDomain(rows)).toEqual([-3, 15])
	})
	it('is null with nothing to span', () => {
		expect(boxDomain([{}])).toBeNull()
	})
})

describe('stackDomain', () => {
	const rows = [
		{ q: 'Q1', p: 'A', v: 3 },
		{ q: 'Q1', p: 'B', v: 4 },
		{ q: 'Q2', p: 'A', v: 2 }
	]
	it('is 0..the tallest column total', () => {
		expect(stackDomain(rows, { x: 'q', y: 'v', fill: 'p' }, 'stack')).toEqual([0, 7])
	})
	it('is 0..1 when filling to 100%', () => {
		expect(stackDomain(rows, { x: 'q', y: 'v', fill: 'p' }, 'fill')).toEqual([0, 1])
	})
	it('is null with no grouping field — the builder draws plain bars then', () => {
		expect(stackDomain(rows, { x: 'q', y: 'v' }, 'stack')).toBeNull()
	})
	it('is null with no rows or no x', () => {
		expect(stackDomain([], { x: 'q', y: 'v', fill: 'p' }, 'stack')).toBeNull()
		expect(stackDomain(rows, { y: 'v', fill: 'p' }, 'stack')).toBeNull()
	})
	it('ignores a literal colour as a grouping field', () => {
		expect(stackDomain(rows, { x: 'q', y: 'v', color: '#f00', pattern: 'p' }, 'stack')).toEqual([0, 7])
	})
})

describe('waterfallDomain', () => {
	it('spans the running total, including a dip below zero', () => {
		const rows = [{ d: 5 }, { d: -8 }, { d: 2 }]
		expect(waterfallDomain(rows, 'd')).toEqual([-3, 5])
	})
	it('a total row spans 0..the running total', () => {
		const rows = [{ d: 4 }, { d: 3 }, { d: 0, t: true }]
		expect(waterfallDomain(rows, 'd', 't')).toEqual([0, 7])
	})
	it('a total row at a running total of 0 does not add its own value', () => {
		const rows = [{ d: 5 }, { d: -5 }, { d: 99, t: true }, { d: 1 }]
		expect(waterfallDomain(rows, 'd', 't')).toEqual([0, 5])
	})
	it('is null with no rows', () => {
		expect(waterfallDomain([], 'd')).toBeNull()
	})
})

describe('resolveValueDomain — the per-geom resolver table', () => {
	const geomData = (rows) => () => rows
	it('asks box, then stack, then waterfall — first non-null wins', () => {
		const box = { type: 'box', id: 'b' }
		const stacked = { type: 'bar', id: 's', options: { position: 'stack' } }
		const channels = { x: 'q', y: 'v', fill: 'p' }
		const boxRows = [{ iqr_min: 1, iqr_max: 2 }]
		const pick = (geoms, rows) => resolveValueDomain(geoms, geomData(rows), channels, 'v')
		expect(pick([stacked, box], boxRows)).toEqual([1, 2])
		expect(pick([stacked], [{ q: 'Q1', p: 'A', v: 3 }])).toEqual([0, 3])
		expect(pick([{ type: 'waterfall', id: 'w' }], [{ v: 2 }])).toEqual([0, 2])
		expect(pick([{ type: 'point', id: 'p' }], [{ v: 2 }])).toBeNull()
	})
	it('treats the deprecated stack flag as stacking', () => {
		const geoms = [{ type: 'bar', id: 's', options: { stack: true } }]
		expect(resolveValueDomain(geoms, geomData([{ q: 'Q1', p: 'A', v: 3 }]), { x: 'q', fill: 'p' }, 'v')).toEqual([0, 3])
	})
})
