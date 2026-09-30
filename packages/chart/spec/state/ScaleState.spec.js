import { describe, it, expect } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { GeomRegistry } from '../../src/state/GeomRegistry.svelte.js'
import { PlotFrame } from '../../src/state/PlotFrame.svelte.js'
import { ChannelState } from '../../src/state/ChannelState.svelte.js'
import { OrientationState } from '../../src/state/OrientationState.svelte.js'
import { InteractionState } from '../../src/state/InteractionState.svelte.js'
import { ScaleState } from '../../src/state/ScaleState.svelte.js'

const rows = [
	{ q: 'Q1', p: 'A', v: 3 },
	{ q: 'Q1', p: 'B', v: 4 },
	{ q: 'Q2', p: 'A', v: 2 }
]
const build = (config, geoms = []) => {
	const c = new PlotConfig({ data: rows, width: 330, height: 260, margin: { top: 0, right: 0, bottom: 0, left: 0 }, ...config })
	const registry = new GeomRegistry(c)
	for (const g of geoms) registry.register({ channels: {}, ...g })
	const channels = new ChannelState(c, registry)
	const orientation = new OrientationState(c, channels, registry)
	const interaction = new InteractionState(c)
	return {
		scales: new ScaleState({ config: c, geoms: registry, channels, orientation, frame: new PlotFrame(c), interaction }),
		interaction
	}
}

describe('ScaleState', () => {
	it('bands a categorical x across the frame and gives y a zero baseline', () => {
		const { scales } = build({ channels: { x: 'q', y: 'v' } }, [{ type: 'bar' }])
		expect(scales.x.domain()).toEqual(['Q1', 'Q2'])
		expect(typeof scales.x.bandwidth).toBe('function')
		expect(scales.y.domain()[0]).toBe(0)
		expect(scales.band).toBe(scales.x)
		expect(scales.value).toBe(scales.y)
	})

	it('sizes y to the stacked column total', () => {
		const { scales } = build({ channels: { x: 'q', y: 'v', fill: 'p' } }, [{ type: 'bar', options: { position: 'stack' } }])
		expect(scales.y.domain()[1]).toBeGreaterThanOrEqual(7)
	})

	it('an explicit domain wins over everything', () => {
		const { scales } = build({ channels: { x: 'q', y: 'v' }, yDomain: [0, 100] }, [{ type: 'bar' }])
		expect(scales.y.domain()).toEqual([0, 100])
	})

	it('sorts the band domain by value when asked', () => {
		const { scales } = build({ channels: { x: 'q', y: 'v' }, sort: 'asc' }, [{ type: 'bar' }])
		expect(scales.x.domain()).toEqual(['Q2', 'Q1'])
	})

	it('has no scale without the channel', () => {
		const { scales } = build({ channels: { y: 'v' } })
		expect(scales.x).toBeNull()
	})

	it('rescales a continuous axis through the zoom transform', () => {
		const data = [{ a: 0, b: 0 }, { a: 10, b: 10 }]
		const { scales, interaction } = build({ data, channels: { x: 'a', y: 'b' } })
		const before = scales.x.domain()
		interaction.applyZoom({ rescaleX: (s) => s.copy().domain([2, 4]), rescaleY: (s) => s.copy().domain([1, 3]) })
		expect(scales.x.domain()).toEqual([2, 4])
		expect(scales.y.domain()).toEqual([1, 3])
		interaction.resetZoom()
		expect(scales.x.domain()).toEqual(before)
	})
})
