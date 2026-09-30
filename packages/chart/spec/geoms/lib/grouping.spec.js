import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { coordOf, groupRows, screenPoints } from '../../../src/geoms/lib/grouping.js'
import { buildHullMarks } from '../../../src/geoms/lib/marks/hull.js'
import { buildContourMarks } from '../../../src/geoms/lib/marks/contour.js'

const lin = scaleLinear().domain([0, 10]).range([0, 100])
const band = scaleBand().domain(['a', 'b']).range([0, 100])

describe('coordOf', () => {
	it('maps a continuous value straight through', () => {
		expect(coordOf(lin, 5)).toBe(50)
	})

	it('puts a band category at its centre', () => {
		expect(coordOf(band, 'b')).toBe(75)
	})

	it('drops missing, empty, unknown and NaN values', () => {
		expect(coordOf(lin, null)).toBeNull()
		expect(coordOf(lin, undefined)).toBeNull()
		expect(coordOf(lin, '')).toBeNull()
		expect(coordOf(band, 'zzz')).toBeNull()
		expect(coordOf(lin, 'n/a')).toBeNull()
	})
})

describe('groupRows', () => {
	it('buckets by field in first-seen order, or one null bucket without a field', () => {
		const rows = [{ g: 'b' }, { g: 'a' }, { g: 'b' }]
		expect([...groupRows(rows, 'g').keys()]).toEqual(['b', 'a'])
		expect([...groupRows(rows, undefined).keys()]).toEqual([null])
	})
})

describe('screenPoints', () => {
	it('places each usable row and skips the rest', () => {
		const plot = { xScale: lin, yScale: lin, place: (u, v) => ({ x: u, y: v }) }
		const rows = [{ x: 1, y: 2 }, { x: null, y: 2 }, { x: 3, y: 4 }]
		expect(screenPoints(rows, plot, { x: 'x', y: 'y' })).toEqual([
			[10, 20],
			[30, 40]
		])
	})
})

describe('group geoms skip what they cannot place', () => {
	const plot = {
		xScale: lin,
		yScale: lin,
		innerWidth: 100,
		innerHeight: 100,
		colors: new Map(),
		place: (u, v) => ({ x: u, y: v })
	}
	const rows = [
		{ x: 1, y: 1, g: 'ok' },
		{ x: 2, y: 3, g: 'ok' },
		{ x: null, y: 1, g: 'empty' }
	]
	const channels = { x: 'x', y: 'y', color: 'g' }

	it('hull: no marks without scales, and none for a group with no usable rows', () => {
		expect(buildHullMarks({ data: rows, plot: { ...plot, xScale: null }, channels })).toEqual([])
		expect(buildHullMarks({ data: rows, plot, channels }).map((m) => m.group)).toEqual(['ok'])
	})

	it('contour: no marks without scales, and none for a group with no usable rows', () => {
		expect(buildContourMarks({ data: rows, plot: { ...plot, yScale: null }, channels })).toEqual([])
		const groups = new Set(buildContourMarks({ data: rows, plot, channels }).map((m) => m.group))
		expect(groups.has('empty')).toBe(false)
	})
})
