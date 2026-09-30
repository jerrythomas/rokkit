import { describe, it, expect } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { GeomRegistry } from '../../src/state/GeomRegistry.svelte.js'
import { ChannelState } from '../../src/state/ChannelState.svelte.js'
import { AestheticState } from '../../src/state/AestheticState.svelte.js'

const data = [
	{ k: 'a', n: 1, s: 'x' },
	{ k: 'b', n: 9, s: 'y' }
]
const make = (config) => {
	const c = new PlotConfig({ data, ...config })
	return new AestheticState(c, new ChannelState(c, new GeomRegistry(c)))
}

describe('AestheticState', () => {
	it('gives each category a palette entry', () => {
		const a = make({ channels: { color: 'k' } })
		expect([...a.colors.keys()]).toEqual(['a', 'b'])
		expect(a.colorScaleType).toBe('categorical')
		expect(a.continuousColorScale).toBeNull()
	})

	it('paints every mark one literal colour', () => {
		const a = make({ channels: { color: '#123456' } })
		expect(a.colors.get(null)).toEqual({ fill: '#123456', stroke: '#123456' })
	})

	it('colours a single series from the first palette entry', () => {
		const a = make({ channels: {} })
		expect([...a.colors.keys()]).toEqual([null])
	})

	it('builds a sequential or diverging scale for a numeric colour field', () => {
		expect(make({ channels: { color: 'n' } }).colorScaleType).toBe('sequential')
		const diverging = make({ channels: { color: 'n' }, colorMidpoint: 5 })
		expect(diverging.colorScaleType).toBe('diverging')
		expect(diverging.continuousColorScale).toBeTruthy()
	})

	it('patterns and symbols only a categorical field', () => {
		expect(make({ channels: { pattern: 'k' } }).patterns.size).toBe(2)
		expect(make({ channels: { pattern: 'n' } }).patterns.size).toBe(0)
		expect(make({ channels: { symbol: 's' } }).symbols.size).toBe(2)
		expect(make({ channels: {} }).symbols.size).toBe(0)
	})
})
