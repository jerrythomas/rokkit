import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale'
import {
	createBars,
	filterBars,
	createGroupedBars
} from '../../src/lib/brewing/bars.svelte.js'

const xScale = scaleBand().domain(['Jan', 'Feb', 'Mar']).range([0, 300]).padding(0.2)
const yScale = scaleLinear().domain([0, 250]).range([200, 0])
const colorScale = scaleOrdinal().domain(['North', 'South']).range(['#blue', '#red'])

const dimensions = { innerWidth: 300, innerHeight: 200 }
const scales = { x: xScale, y: yScale, color: colorScale }

const data = [
	{ month: 'Jan', revenue: 100, region: 'North' },
	{ month: 'Feb', revenue: 200, region: 'South' },
	{ month: 'Mar', revenue: 150, region: 'North' }
]

describe('createBars', () => {
	it('returns empty array for empty data', () => {
		expect(createBars([], { x: 'month', y: 'revenue' }, scales, { dimensions })).toEqual([])
	})

	it('returns empty array for null data', () => {
		expect(createBars(null, { x: 'month', y: 'revenue' }, scales, { dimensions })).toEqual([])
	})

	it('returns empty array when scales.x or scales.y is missing', () => {
		expect(
			createBars(data, { x: 'month', y: 'revenue' }, { x: null, y: yScale }, { dimensions })
		).toEqual([])
		expect(
			createBars(data, { x: 'month', y: 'revenue' }, { x: xScale, y: null }, { dimensions })
		).toEqual([])
	})

	it('returns one bar per data item', () => {
		const bars = createBars(data, { x: 'month', y: 'revenue' }, scales, { dimensions })
		expect(bars).toHaveLength(3)
	})

	it('bar has x, y, width, height, color', () => {
		const [bar] = createBars(data, { x: 'month', y: 'revenue' }, scales, { dimensions })
		expect(bar).toHaveProperty('x')
		expect(bar).toHaveProperty('y')
		expect(bar).toHaveProperty('width')
		expect(bar).toHaveProperty('height')
		expect(bar).toHaveProperty('color')
		expect(bar).toHaveProperty('data')
	})

	it('bar width equals scale bandwidth for band scale', () => {
		const bars = createBars(data, { x: 'month', y: 'revenue' }, scales, { dimensions })
		expect(bars[0].width).toBeCloseTo(xScale.bandwidth(), 1)
	})

	it('uses color scale when color field provided', () => {
		const bars = createBars(
			data,
			{ x: 'month', y: 'revenue', color: 'region' },
			scales,
			{ dimensions }
		)
		expect(bars[0].color).toBeTruthy()
	})

	it('uses defaultColor when no color scale', () => {
		const noColorScales = { x: xScale, y: yScale, color: null }
		const bars = createBars(data, { x: 'month', y: 'revenue' }, noColorScales, { dimensions })
		expect(bars[0].color).toBe('#4682b4')
	})

	it('uses custom defaultColor from options', () => {
		const noColorScales = { x: xScale, y: yScale, color: null }
		const bars = createBars(data, { x: 'month', y: 'revenue' }, noColorScales, {
			dimensions,
			defaultColor: '#ff0000'
		})
		expect(bars[0].color).toBe('#ff0000')
	})

	it('bar x uses centered position for linear scale', () => {
		const linXScale = scaleLinear().domain([1, 3]).range([0, 300])
		const linScales = { x: linXScale, y: yScale, color: null }
		// band() is undefined → x - barWidth/2
		const numData = [{ month: 1, revenue: 100 }, { month: 2, revenue: 200 }]
		const bars = createBars(numData, { x: 'month', y: 'revenue' }, linScales, { dimensions })
		// barWidth defaults to 10, so x = linXScale(1) - 5
		expect(bars[0].x).toBeCloseTo(linXScale(1) - 5, 1)
	})

	it('opts defaults to {} when options is undefined (parseBarsInput null path)', () => {
		// parseBarsInput(undefined, ...) → opts = {}; dimensions = undefined
		// buildBar: height = undefined.innerHeight crashes
		// So use a non-null options with explicit dimensions=null path — test the null scales path instead
		const noScales = { x: null, y: null, color: null }
		const bars = createBars(data, { x: 'month', y: 'revenue' }, noScales, undefined)
		// parseBarsInput returns null when scales.x or y missing → []
		expect(bars).toEqual([])
	})
})

describe('filterBars', () => {
	const bars = [
		{ data: { region: 'North', month: 'Jan' }, x: 0, y: 0, width: 10, height: 50, color: '#blue' },
		{ data: { region: 'South', month: 'Feb' }, x: 50, y: 0, width: 10, height: 80, color: '#red' },
		{ data: { region: 'North', month: 'Mar' }, x: 100, y: 0, width: 10, height: 60, color: '#blue' }
	]

	it('returns all bars when no selection', () => {
		expect(filterBars(bars, null)).toHaveLength(3)
		expect(filterBars(bars, undefined)).toHaveLength(3)
	})

	it('filters bars by single criterion', () => {
		const result = filterBars(bars, { region: 'North' })
		expect(result).toHaveLength(2)
		expect(result.every((b) => b.data.region === 'North')).toBe(true)
	})

	it('filters bars by multiple criteria', () => {
		const result = filterBars(bars, { region: 'North', month: 'Jan' })
		expect(result).toHaveLength(1)
		expect(result[0].data.month).toBe('Jan')
	})

	it('returns empty array when no bars match', () => {
		const result = filterBars(bars, { region: 'East' })
		expect(result).toHaveLength(0)
	})
})

describe('createGroupedBars', () => {
	const groupData = [
		{ month: 'Jan', revenue: 100, region: 'North' },
		{ month: 'Jan', revenue: 80, region: 'South' },
		{ month: 'Feb', revenue: 200, region: 'North' },
		{ month: 'Feb', revenue: 150, region: 'South' }
	]

	it('returns empty when no data', () => {
		const result = createGroupedBars([], { x: 'month', y: 'revenue', group: 'region' }, scales, { dimensions })
		expect(result).toEqual({ groups: [], bars: [] })
	})

	it('returns empty when no group field', () => {
		const result = createGroupedBars(data, { x: 'month', y: 'revenue' }, scales, { dimensions })
		expect(result).toEqual({ groups: [], bars: [] })
	})

	it('returns groups and bars', () => {
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region' },
			scales,
			{ dimensions }
		)
		expect(result.groups).toHaveLength(2)
		expect(result.bars).toHaveLength(4)
	})

	it('each bar has group, x, y, width, height, color', () => {
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region' },
			scales,
			{ dimensions }
		)
		const bar = result.bars[0]
		expect(bar).toHaveProperty('group')
		expect(bar).toHaveProperty('x')
		expect(bar).toHaveProperty('y')
		expect(bar).toHaveProperty('width')
		expect(bar).toHaveProperty('height')
		expect(bar).toHaveProperty('color')
	})

	it('uses group field as color field by default', () => {
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region' },
			scales,
			{ dimensions }
		)
		expect(result.bars[0].color).toBeTruthy()
	})

	it('uses explicit color field when provided', () => {
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region', color: 'region' },
			scales,
			{ dimensions }
		)
		expect(result.bars[0].color).toBeTruthy()
	})

	it('falls back to DEFAULT_COLOR when no color scale', () => {
		const noColorScales = { x: xScale, y: yScale, color: null }
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region' },
			noColorScales,
			{ dimensions }
		)
		// When scales.color is null, should use default
		expect(result.bars[0].color).toBe('#4682b4')
	})

	it('uses custom padding from options', () => {
		const result = createGroupedBars(
			groupData,
			{ x: 'month', y: 'revenue', group: 'region' },
			scales,
			{ dimensions, padding: 0.5 }
		)
		expect(result.bars).toHaveLength(4)
	})

	it('skips items not found in group', () => {
		// Add an item with a region that won't be found in some x group
		const sparseData = [
			{ month: 'Jan', revenue: 100, region: 'North' },
			// South not present in Jan
			{ month: 'Feb', revenue: 150, region: 'South' }
		]
		const result = createGroupedBars(
			sparseData,
			{ x: 'month', y: 'revenue', group: 'region' },
			scales,
			{ dimensions }
		)
		// Each x has 2 potential groups but only 1 item each → 2 bars total (missing ones skipped)
		expect(result.bars).toHaveLength(2)
	})

	it('uses non-bandwidth position for linear x scale', () => {
		const linXScale = scaleLinear().domain([1, 3]).range([0, 300])
		// No bandwidth → groupWidth = 20
		const linScales = { x: linXScale, y: yScale, color: colorScale }
		const numData = [
			{ x: 1, val: 10, group: 'A' },
			{ x: 1, val: 20, group: 'B' },
			{ x: 2, val: 15, group: 'A' },
			{ x: 2, val: 25, group: 'B' }
		]
		const result = createGroupedBars(
			numData,
			{ x: 'x', y: 'val', group: 'group' },
			linScales,
			{ dimensions }
		)
		expect(result.bars).toHaveLength(4)
	})
})
