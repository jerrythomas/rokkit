import { describe, it, expect } from 'vitest'
import { buildLegendGroups } from '../../src/lib/brewing/brewer.svelte.js'

describe('buildLegendGroups', () => {
	const colorMap = new Map([
		['North', { fill: '#blue', stroke: '#darkblue' }],
		['South', { fill: '#red', stroke: '#darkred' }]
	])
	const patternMap = new Map([
		['North', 'Dots'],
		['South', 'Waves']
	])
	const symbolMap = new Map([
		['Basic', 'circle'],
		['Pro', 'triangle']
	])

	it('returns empty array when no aesthetic channels set', () => {
		const result = buildLegendGroups({}, colorMap, patternMap, symbolMap)
		expect(result).toEqual([])
	})

	it('single color field → one group with fill/stroke', () => {
		const result = buildLegendGroups({ color: 'region' }, colorMap, patternMap, symbolMap)
		expect(result).toHaveLength(1)
		expect(result[0].field).toBe('region')
		expect(result[0].items).toHaveLength(2)
		expect(result[0].items[0]).toMatchObject({
			label: 'North',
			fill: '#blue',
			stroke: '#darkblue',
			patternId: null,
			shape: null
		})
	})

	it('same field for color + pattern → one merged group', () => {
		const result = buildLegendGroups(
			{ color: 'region', pattern: 'region' },
			colorMap,
			patternMap,
			symbolMap
		)
		expect(result).toHaveLength(1)
		expect(result[0].field).toBe('region')
		expect(result[0].items[0]).toMatchObject({
			label: 'North',
			fill: '#blue',
			patternId: 'chart-pat-North'
		})
	})

	it('different fields for color + symbol → two separate groups', () => {
		const result = buildLegendGroups(
			{ color: 'region', symbol: 'tier' },
			colorMap,
			patternMap,
			symbolMap
		)
		expect(result).toHaveLength(2)
		expect(result[0].field).toBe('region')
		expect(result[0].items[0]).toMatchObject({ fill: '#blue', shape: null })
		expect(result[1].field).toBe('tier')
		expect(result[1].items[0]).toMatchObject({ label: 'Basic', fill: null, shape: 'circle' })
	})

	it('pattern field only → one group with patternId, fill null', () => {
		const pm2 = new Map([
			['Basic', 'Dots'],
			['Pro', 'Waves']
		])
		const r2 = buildLegendGroups({ pattern: 'tier' }, colorMap, pm2, symbolMap)
		expect(r2).toHaveLength(1)
		expect(r2[0].items[0]).toMatchObject({ fill: null, patternId: 'chart-pat-Basic' })
	})
})
