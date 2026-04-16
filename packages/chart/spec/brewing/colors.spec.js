import { describe, it, expect } from 'vitest'
import { assignColors, distinct, isLiteralColor, buildSequentialScale, buildDivergingScale } from '../../src/lib/brewing/colors.js'
import { defaultPreset, createChartPreset } from '../../src/lib/preset.js'
import masterPalette from '../../src/lib/palette.json'

describe('assignColors', () => {
	it('maps values to hex colors using shade indices from preset', () => {
		const result = assignColors(['a', 'b'], 'light')
		// 'blue' is first in defaultPreset.colors, light fill='300', stroke='700'
		expect(result.get('a')).toEqual({
			fill: masterPalette['blue']['300'],
			stroke: masterPalette['blue']['700']
		})
		expect(result.get('b')).toEqual({
			fill: masterPalette['emerald']['300'],
			stroke: masterPalette['emerald']['700']
		})
	})

	it('uses dark shades in dark mode', () => {
		const result = assignColors(['x'], 'dark')
		expect(result.get('x')).toEqual({
			fill: masterPalette['blue']['500'],
			stroke: masterPalette['blue']['200']
		})
	})

	it('cycles past the preset color list', () => {
		const values = Array.from({ length: 15 }, (_, i) => `v${i}`)
		const result = assignColors(values, 'light')
		// defaultPreset has 14 colors, so v14 wraps back to index 0 ('blue')
		expect(result.get('v14')).toEqual(result.get('v0'))
	})

	it('uses custom preset colors and shades', () => {
		const custom = createChartPreset({
			colors: ['rose'],
			shades: { light: { fill: '200', stroke: '800' } }
		})
		const result = assignColors(['a'], 'light', custom)
		expect(result.get('a')).toEqual({
			fill: masterPalette['rose']['200'],
			stroke: masterPalette['rose']['800']
		})
	})

	it('falls back to #888/#444 for unknown color names', () => {
		const custom = createChartPreset({ colors: ['nonexistent-color'] })
		const result = assignColors(['a'], 'light', custom)
		expect(result.get('a')).toEqual({ fill: '#888', stroke: '#444' })
	})
})

describe('isLiteralColor', () => {
	it('detects hex colors', () => {
		expect(isLiteralColor('#fff')).toBe(true)
		expect(isLiteralColor('#4a90d9')).toBe(true)
		expect(isLiteralColor('#4a90d9ff')).toBe(true)
	})

	it('detects functional color notations', () => {
		expect(isLiteralColor('rgb(100, 100, 100)')).toBe(true)
		expect(isLiteralColor('rgba(0,0,0,0.5)')).toBe(true)
		expect(isLiteralColor('hsl(200 50% 50%)')).toBe(true)
		expect(isLiteralColor('oklch(0.7 0.15 200)')).toBe(true)
	})

	it('returns false for field names', () => {
		expect(isLiteralColor('region')).toBe(false)
		expect(isLiteralColor('category')).toBe(false)
		expect(isLiteralColor('year')).toBe(false)
	})

	it('returns false for falsy values', () => {
		expect(isLiteralColor(null)).toBe(false)
		expect(isLiteralColor(undefined)).toBe(false)
		expect(isLiteralColor('')).toBe(false)
	})
})

describe('distinct', () => {
	it('returns distinct values for a field', () => {
		const data = [{ region: 'North' }, { region: 'South' }, { region: 'North' }]
		expect(distinct(data, 'region')).toEqual(['North', 'South'])
	})

	it('returns empty array if field is null', () => {
		expect(distinct([{ x: 1 }], null)).toEqual([])
	})
})

describe('buildSequentialScale', () => {
	const data = [{ v: 0 }, { v: 50 }, { v: 100 }]

	it('returns a scale function that maps values to colors', () => {
		const result = buildSequentialScale(data, 'v')
		expect(result.type).toBe('sequential')
		expect(typeof result.scale).toBe('function')
		expect(typeof result.scale(50)).toBe('string')
	})

	it('infers domain from data', () => {
		const result = buildSequentialScale(data, 'v')
		expect(result.domain).toEqual([0, 100])
	})

	it('accepts explicit domain', () => {
		const result = buildSequentialScale(data, 'v', { colorDomain: [10, 90] })
		expect(result.domain).toEqual([10, 90])
	})

	it('returns different colors at domain extremes', () => {
		const result = buildSequentialScale(data, 'v')
		const low = result.scale(0)
		const high = result.scale(100)
		expect(low).not.toBe(high)
	})

	it('accepts a named color scheme', () => {
		const result = buildSequentialScale(data, 'v', { colorScheme: 'viridis' })
		expect(typeof result.scale(50)).toBe('string')
	})
})

describe('buildDivergingScale', () => {
	const data = [{ v: -10 }, { v: 0 }, { v: 10 }]

	it('returns a diverging scale with three-point domain', () => {
		const result = buildDivergingScale(data, 'v')
		expect(result.type).toBe('diverging')
		expect(result.domain).toEqual([-10, 0, 10])
	})

	it('uses custom midpoint', () => {
		const result = buildDivergingScale(data, 'v', { colorMidpoint: 5 })
		expect(result.domain).toEqual([-10, 5, 10])
	})

	it('accepts a named color scheme', () => {
		const result = buildDivergingScale(data, 'v', { colorScheme: 'rdbu' })
		expect(typeof result.scale(0)).toBe('string')
	})

	it('returns different colors at extremes vs midpoint', () => {
		const result = buildDivergingScale(data, 'v', { colorScheme: 'rdbu' })
		const low = result.scale(-10)
		const mid = result.scale(0)
		const high = result.scale(10)
		expect(low).not.toBe(mid)
		expect(mid).not.toBe(high)
	})
})
