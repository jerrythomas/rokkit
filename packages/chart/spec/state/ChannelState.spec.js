import { describe, it, expect } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { GeomRegistry } from '../../src/state/GeomRegistry.svelte.js'
import { ChannelState } from '../../src/state/ChannelState.svelte.js'

const data = [
	{ q: 'Q1', v: 1, p: 'A', s: 'x' },
	{ q: 'Q2', v: 2, p: 'B', s: 'y' }
]
const make = (channels = {}) => {
	const config = new PlotConfig({ data, channels })
	const geoms = new GeomRegistry(config)
	return { config, geoms, ch: new ChannelState(config, geoms) }
}

describe('ChannelState — effective channels', () => {
	it('is the container’s channels when no geom is mounted', () => {
		const { ch } = make({ x: 'q', y: 'v' })
		expect(ch.effective).toEqual({ x: 'q', y: 'v' })
	})

	it('fills each field the container omits from the FIRST geom, per field', () => {
		const { ch, geoms } = make({ x: 'q' })
		geoms.register({ type: 'bar', channels: { x: 'ignored', y: 'v', color: 'p' } })
		geoms.register({ type: 'line', channels: { symbol: 's' } })
		expect(ch.effective).toEqual({ x: 'q', y: 'v', color: 'p', fill: undefined, pattern: undefined, symbol: undefined })
	})
})

describe('ChannelState — field getters', () => {
	it('reports mapped fields, and null for a literal colour', () => {
		const { ch } = make({ x: 'q', y: 'v', color: 'p', fill: '#f00', pattern: 'p', symbol: 's' })
		expect(ch.colorField).toBe('p')
		expect(ch.fillField).toBeNull()
		expect(ch.patternField).toBe('p')
		expect(ch.symbolField).toBe('s')
	})
})

describe('ChannelState — shared colour values', () => {
	it('unions the color and fill fields of the container and every geom, in order, deduped', () => {
		const { ch, geoms } = make({ color: 'p' })
		geoms.register({ type: 'bar', channels: { fill: 's' } })
		geoms.register({ type: 'hull', channels: { color: 'p', fill: 'var(--x)' } })
		expect(ch.colorValues).toEqual(['A', 'B', 'x', 'y'])
	})
})
