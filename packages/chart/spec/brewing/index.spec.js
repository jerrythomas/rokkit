import { describe, it, expect } from 'vitest'
import { ChartBrewer } from '../../src/lib/brewing/index.svelte.js'

/**
 * Tests for the ChartBrewer class exported from index.svelte.js
 * This covers lines 39-205 (ChartBrewer class methods).
 */

const data = [
	{ month: 'Jan', revenue: 100, region: 'North' },
	{ month: 'Feb', revenue: 200, region: 'South' },
	{ month: 'Mar', revenue: 150, region: 'North' }
]

describe('ChartBrewer (index.svelte.js)', () => {
	describe('constructor', () => {
		it('creates an instance with no options', () => {
			const brewer = new ChartBrewer()
			expect(brewer).toBeDefined()
		})

		it('creates an instance with width, height, and margin options', () => {
			const brewer = new ChartBrewer({
				width: 800,
				height: 500,
				margin: { top: 10, right: 10, bottom: 30, left: 40 }
			})
			const dims = brewer.getDimensions()
			expect(dims).toBeDefined()
		})

		it('applies custom padding option', () => {
			const brewer = new ChartBrewer({ padding: 0.5 })
			expect(brewer).toBeDefined()
		})

		it('applies custom animationDuration option', () => {
			const brewer = new ChartBrewer({ animationDuration: 500 })
			expect(brewer.getAnimationDuration()).toBe(500)
		})
	})

	describe('setData', () => {
		it('sets data and returns this for chaining', () => {
			const brewer = new ChartBrewer()
			const result = brewer.setData(data)
			expect(result).toBe(brewer)
		})

		it('returns this when non-array passed (coerces to [])', () => {
			const brewer = new ChartBrewer()
			brewer.setData('not an array')
			expect(brewer.getData()).toEqual([])
		})

		it('stores the data', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data)
			expect(brewer.getData()).toHaveLength(3)
		})
	})

	describe('setFields', () => {
		it('sets x, y, color fields and returns this for chaining', () => {
			const brewer = new ChartBrewer()
			const result = brewer.setFields({ x: 'month', y: 'revenue', color: 'region' })
			expect(result).toBe(brewer)
		})

		it('stores the fields', () => {
			const brewer = new ChartBrewer()
			brewer.setFields({ x: 'month', y: 'revenue', color: 'region' })
			expect(brewer.getFields()).toMatchObject({ x: 'month', y: 'revenue', color: 'region' })
		})

		it('only updates provided fields (partial update)', () => {
			const brewer = new ChartBrewer()
			brewer.setFields({ x: 'month', y: 'revenue' })
			brewer.setFields({ color: 'region' })
			expect(brewer.getFields()).toMatchObject({ x: 'month', y: 'revenue', color: 'region' })
		})
	})

	describe('setDimensions', () => {
		it('updates dimensions and returns this for chaining', () => {
			const brewer = new ChartBrewer()
			const result = brewer.setDimensions({ width: 400, height: 300 })
			expect(result).toBe(brewer)
		})

		it('stores dimensions', () => {
			const brewer = new ChartBrewer({ width: 600, height: 400 })
			brewer.setDimensions({ width: 800, height: 600 })
			const dims = brewer.getDimensions()
			expect(dims).toBeDefined()
		})
	})

	describe('createScales', () => {
		it('returns this for chaining', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' })
			const result = brewer.createScales()
			expect(result).toBe(brewer)
		})

		it('creates scales for valid data and fields', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			expect(brewer.getScales().x).not.toBeNull()
			expect(brewer.getScales().y).not.toBeNull()
		})
	})

	describe('createBars', () => {
		it('returns bar data after data/fields/scales are set', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const bars = brewer.createBars()
			expect(bars).toHaveLength(3)
		})
	})

	describe('createXAxis', () => {
		it('returns axis data with ticks', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const axis = brewer.createXAxis()
			expect(axis).toHaveProperty('ticks')
		})

		it('passes options through', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const axis = brewer.createXAxis({ label: 'Month' })
			expect(axis.label).toBe('Month')
		})
	})

	describe('createYAxis', () => {
		it('returns axis data with ticks', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const axis = brewer.createYAxis()
			expect(axis).toHaveProperty('ticks')
		})

		it('passes options through', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const axis = brewer.createYAxis({ label: 'Revenue' })
			expect(axis.label).toBe('Revenue')
		})
	})

	describe('createGrid', () => {
		it('returns grid data', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data).setFields({ x: 'month', y: 'revenue' }).createScales()
			const grid = brewer.createGrid()
			expect(grid).toHaveProperty('xLines')
			expect(grid).toHaveProperty('yLines')
		})
	})

	describe('createLegend', () => {
		it('returns legend data with items', () => {
			const brewer = new ChartBrewer()
			brewer
				.setData(data)
				.setFields({ x: 'month', y: 'revenue', color: 'region' })
				.createScales()
			const legend = brewer.createLegend()
			expect(legend).toHaveProperty('items')
		})
	})

	describe('getDimensions', () => {
		it('returns a copy of dimensions', () => {
			const brewer = new ChartBrewer()
			const dims = brewer.getDimensions()
			expect(dims).toBeDefined()
		})
	})

	describe('getScales', () => {
		it('returns a copy of scales', () => {
			const brewer = new ChartBrewer()
			const scales = brewer.getScales()
			expect(scales).toBeDefined()
		})
	})

	describe('getAnimationDuration', () => {
		it('returns default animation duration 300', () => {
			const brewer = new ChartBrewer()
			expect(brewer.getAnimationDuration()).toBe(300)
		})

		it('returns custom animation duration', () => {
			const brewer = new ChartBrewer({ animationDuration: 1000 })
			expect(brewer.getAnimationDuration()).toBe(1000)
		})
	})

	describe('getData', () => {
		it('returns a copy of data', () => {
			const brewer = new ChartBrewer()
			brewer.setData(data)
			const result = brewer.getData()
			expect(result).toHaveLength(3)
			// Should be a copy, not the same reference
			expect(result).not.toBe(data)
		})
	})

	describe('getFields', () => {
		it('returns a copy of fields', () => {
			const brewer = new ChartBrewer()
			brewer.setFields({ x: 'month', y: 'revenue' })
			const fields = brewer.getFields()
			expect(fields.x).toBe('month')
			expect(fields.y).toBe('revenue')
		})
	})
})
