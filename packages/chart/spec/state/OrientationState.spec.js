import { describe, it, expect } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { GeomRegistry } from '../../src/state/GeomRegistry.svelte.js'
import { ChannelState } from '../../src/state/ChannelState.svelte.js'
import { OrientationState } from '../../src/state/OrientationState.svelte.js'

const cats = [{ c: 'a', v: 1 }, { c: 'b', v: 2 }]
const nums = [{ n: 1, v: 1 }, { n: 2, v: 2 }]

const make = (data, channels, { geoms = [], orientation } = {}) => {
	const config = new PlotConfig({ data, channels, orientation })
	const registry = new GeomRegistry(config)
	for (const type of geoms) registry.register({ type, channels: {} })
	return new OrientationState(config, new ChannelState(config, registry), registry)
}

describe('OrientationState', () => {
	it('is vertical for categories on x', () => {
		const o = make(cats, { x: 'c', y: 'v' })
		expect(o.orientation).toBe('vertical')
		expect(o.bandIsX).toBe(true)
		expect(o.flipped).toBe(false)
	})

	it('is none without both channels, and nothing is a band', () => {
		const o = make(cats, { x: 'c' })
		expect(o.orientation).toBe('none')
		expect(o.bandIsX).toBe(false)
	})

	it('a bar geom bands a numeric x, so it can flip', () => {
		const plain = make(nums, { x: 'n', y: 'v' })
		const bars = make(nums, { x: 'n', y: 'v' }, { geoms: ['bar'] })
		expect(plain.bandIsX).toBe(false)
		expect(bars.bandIsX).toBe(true)
		expect(bars.hasBandGeom).toBe(true)
	})

	it('flips only when horizontal AND the band is on x', () => {
		const bars = make(cats, { x: 'c', y: 'v' }, { orientation: 'horizontal' })
		expect(bars.flipped).toBe(true)
		const scatter = make(nums, { x: 'n', y: 'v' }, { orientation: 'horizontal' })
		expect(scatter.orientation).toBe('horizontal')
		expect(scatter.flipped).toBe(false)
	})

	it('place() swaps screen axes only when flipped', () => {
		expect(make(cats, { x: 'c', y: 'v' }).place(1, 2)).toEqual({ x: 1, y: 2 })
		expect(make(cats, { x: 'c', y: 'v' }, { orientation: 'horizontal' }).place(1, 2)).toEqual({ x: 2, y: 1 })
	})
})
