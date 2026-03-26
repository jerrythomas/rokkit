import { describe, it, expect } from 'vitest'
import { assignColors, distinct } from '../../src/lib/brewing/colors.js'
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

describe('distinct', () => {
	it('returns distinct values for a field', () => {
		const data = [{ region: 'North' }, { region: 'South' }, { region: 'North' }]
		expect(distinct(data, 'region')).toEqual(['North', 'South'])
	})

	it('returns empty array if field is null', () => {
		expect(distinct([{ x: 1 }], null)).toEqual([])
	})
})
