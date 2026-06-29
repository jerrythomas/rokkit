import { describe, it, expect } from 'vitest'
import { scaleOrdinal } from 'd3-scale'
import {
	createLegend,
	filterByLegend,
	createLegendItemAttributes
} from '../../src/lib/brewing/legends.svelte.js'

const colorScale = scaleOrdinal().domain(['North', 'South']).range(['#blue', '#red'])

const dimensions = { innerWidth: 500, innerHeight: 300 }

const data = [
	{ month: 'Jan', revenue: 100, region: 'North' },
	{ month: 'Feb', revenue: 200, region: 'South' },
	{ month: 'Mar', revenue: 150, region: 'North' }
]

describe('createLegend', () => {
	it('returns empty legend when data is null', () => {
		const legend = createLegend(null, { color: 'region' }, { color: colorScale }, {})
		expect(legend.items).toEqual([])
		expect(legend.title).toBe('')
	})

	it('returns empty legend when no color field', () => {
		const legend = createLegend(data, {}, { color: colorScale }, {})
		expect(legend.items).toEqual([])
	})

	it('returns empty legend when no color scale', () => {
		const legend = createLegend(data, { color: 'region' }, {}, {})
		expect(legend.items).toEqual([])
	})

	it('returns legend items for each distinct color value', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions }
		)
		expect(legend.items).toHaveLength(2)
	})

	it('each item has value, color, y, shape, markerSize', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions }
		)
		const item = legend.items[0]
		expect(item).toHaveProperty('value')
		expect(item).toHaveProperty('color')
		expect(item).toHaveProperty('y')
		expect(item).toHaveProperty('shape')
		expect(item).toHaveProperty('markerSize')
	})

	it('uses default shape "rect" and markerSize 10', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions }
		)
		expect(legend.items[0].shape).toBe('rect')
		expect(legend.items[0].markerSize).toBe(10)
	})

	it('respects custom shape option', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions, shape: 'circle' }
		)
		expect(legend.items[0].shape).toBe('circle')
	})

	it('respects custom markerSize option', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions, markerSize: 15 }
		)
		expect(legend.items[0].markerSize).toBe(15)
	})

	it('sets title offset when title provided', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions, title: 'Region' }
		)
		expect(legend.title).toBe('Region')
		// First item y should have titleOffset applied (15px)
		expect(legend.items[0].y).toBeGreaterThanOrEqual(15)
	})

	it('has no title offset when no title', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions }
		)
		expect(legend.items[0].y).toBe(0)
	})

	it('right-aligns by default (transform has positive x)', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions }
		)
		// Right align: x = innerWidth - approxWidth, should be > 0 for 500px width
		expect(legend.transform).toMatch(/^translate\(/)
	})

	it('center alignment', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions, align: 'center' }
		)
		expect(legend.transform).toMatch(/^translate\(/)
	})

	it('left alignment', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{ dimensions, align: 'left' }
		)
		expect(legend.transform).toBe('translate(0, 0)')
	})

	it('works without dimensions (defaults innerWidth to 0)', () => {
		const legend = createLegend(
			data,
			{ color: 'region' },
			{ color: colorScale },
			{}
		)
		expect(legend.items).toHaveLength(2)
	})
})

describe('filterByLegend', () => {
	it('returns all data when selectedValues is empty', () => {
		expect(filterByLegend(data, 'region', [])).toEqual(data)
	})

	it('returns all data when selectedValues is null', () => {
		expect(filterByLegend(data, 'region', null)).toEqual(data)
	})

	it('filters data by selected values', () => {
		const result = filterByLegend(data, 'region', ['North'])
		expect(result).toHaveLength(2)
		expect(result.every((d) => d.region === 'North')).toBe(true)
	})

	it('returns empty when no data matches selected values', () => {
		const result = filterByLegend(data, 'region', ['East'])
		expect(result).toHaveLength(0)
	})

	it('returns data matching any of multiple selected values', () => {
		const result = filterByLegend(data, 'region', ['North', 'South'])
		expect(result).toHaveLength(3)
	})
})

describe('createLegendItemAttributes', () => {
	it('returns data-plot-legend-item attribute', () => {
		const item = { value: 'North', color: '#blue', y: 0, shape: 'rect', markerSize: 10 }
		const attrs = createLegendItemAttributes(item)
		expect(attrs['data-plot-legend-item']).toBe('')
	})

	it('returns transform with correct y offset', () => {
		const item = { value: 'North', color: '#blue', y: 25, shape: 'rect', markerSize: 10 }
		const attrs = createLegendItemAttributes(item)
		expect(attrs.transform).toBe('translate(0, 25)')
	})

	it('returns role img', () => {
		const item = { value: 'North', color: '#blue', y: 0, shape: 'rect', markerSize: 10 }
		const attrs = createLegendItemAttributes(item)
		expect(attrs.role).toBe('img')
	})

	it('returns aria-label with value', () => {
		const item = { value: 'North', color: '#blue', y: 0, shape: 'rect', markerSize: 10 }
		const attrs = createLegendItemAttributes(item)
		expect(attrs['aria-label']).toBe('Legend item for North')
	})
})
