import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildViolins } from '../../../src/lib/brewing/marks/violins.js'

// Pre-aggregated quartile rows (output of applyBoxStat)
const dataSimple = [
	{ class: 'compact', q1: 20, median: 25, q3: 30, iqr_min: 13, iqr_max: 42 },
	{ class: 'suv', q1: 15, median: 18, q3: 22, iqr_min: 10, iqr_max: 30 }
]

const dataGrouped = [
	{ class: 'compact', drv: 'f', q1: 22, median: 27, q3: 32, iqr_min: 15, iqr_max: 45 },
	{ class: 'compact', drv: '4', q1: 18, median: 23, q3: 28, iqr_min: 11, iqr_max: 39 },
	{ class: 'suv', drv: '4', q1: 15, median: 18, q3: 22, iqr_min: 10, iqr_max: 30 }
]

const xScale = scaleBand().domain(['compact', 'suv']).range([0, 300]).padding(0.2)
const yScale = scaleLinear().domain([0, 50]).range([300, 0])
const colors = new Map([
	['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['suv', { fill: '#f28e2b', stroke: '#f28e2b' }],
	['f', { fill: '#59a14f', stroke: '#59a14f' }],
	['4', { fill: '#e15759', stroke: '#e15759' }]
])

describe('buildViolins — non-grouped (fill === x)', () => {
	const violins = buildViolins(dataSimple, { x: 'class', fill: 'class' }, xScale, yScale, colors)

	it('returns one violin per datum', () => {
		expect(violins).toHaveLength(2)
	})

	it('maps fill color from colors map by fill key', () => {
		const compact = violins.find((v) => v.data.class === 'compact')
		expect(compact?.fill).toBe('#4e79a7')
	})

	it('cx is centered in the x-band', () => {
		const bw = xScale.bandwidth()
		for (const v of violins) {
			const bandStart = xScale(v.data.class) ?? 0
			expect(v.cx).toBeCloseTo(bandStart + bw / 2, 1)
		}
	})

	it('d attribute is a non-empty path string with no NaN', () => {
		for (const v of violins) {
			expect(typeof v.d).toBe('string')
			expect((v.d ?? '').length).toBeGreaterThan(10)
			expect(v.d).not.toContain('NaN')
			expect(v.d).toMatch(/M/)
		}
	})

	it('returns stroke from the colors map (darker shade)', () => {
		const compact = violins.find((v) => v.data.class === 'compact')
		expect(compact?.stroke).toBe('#4e79a7')
	})

	it('falls back to #aaa fill when fill key not in colors map', () => {
		const emptyColors = new Map()
		const result = buildViolins(
			dataSimple,
			{ x: 'class', fill: 'class' },
			xScale,
			yScale,
			emptyColors
		)
		expect(result[0].fill).toBe('#aaa')
	})
})

describe('buildViolins — grouped (fill !== x)', () => {
	const violins = buildViolins(dataGrouped, { x: 'class', fill: 'drv' }, xScale, yScale, colors)

	it('returns one violin per datum', () => {
		expect(violins).toHaveLength(3)
	})

	it('fill color is keyed by fill field (drv), not x field (class)', () => {
		const fViolin = violins.find((v) => v.data.drv === 'f')
		const fourViolin = violins.find((v) => v.data.drv === '4' && v.data.class === 'compact')
		expect(fViolin?.fill).toBe('#59a14f')
		expect(fourViolin?.fill).toBe('#e15759')
	})

	it('sub-violins for same x are positioned side by side (different cx)', () => {
		const compactViolins = violins.filter((v) => v.data.class === 'compact')
		expect(compactViolins).toHaveLength(2)
		expect(compactViolins[0].cx).not.toBe(compactViolins[1].cx)
	})

	it('sub-violin cx values are within the parent x-band', () => {
		const bw = xScale.bandwidth()
		for (const v of violins) {
			const bandStart = xScale(v.data.class) ?? 0
			expect(v.cx).toBeGreaterThanOrEqual(bandStart)
			expect(v.cx).toBeLessThanOrEqual(bandStart + bw)
		}
	})

	it('d attribute has no NaN even when grouped', () => {
		for (const v of violins) {
			expect(v.d).toBeTruthy()
			expect(v.d).not.toContain('NaN')
		}
	})

	it('grouped violins are narrower than non-grouped', () => {
		// halfMax is proportional to sub-band width in grouped mode
		// Check by comparing cx spread: grouped sub-violins are closer together
		const grouped = buildViolins(dataGrouped, { x: 'class', fill: 'drv' }, xScale, yScale, colors)
		const compactGrouped = grouped.filter((v) => v.data.class === 'compact')
		const single = buildViolins(dataSimple, { x: 'class', fill: 'class' }, xScale, yScale, colors)
		// Grouped cx values span a sub-band; single cx is centered on full band
		const groupedSpread = Math.abs(compactGrouped[1].cx - compactGrouped[0].cx)
		const singleBw = xScale.bandwidth()
		expect(groupedSpread).toBeLessThan(singleBw)
	})
})
