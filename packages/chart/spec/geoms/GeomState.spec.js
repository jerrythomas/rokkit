import { describe, it, expect } from 'vitest'
import { GeomState } from '../../src/geoms/lib/GeomState.svelte.js'

function fakePlot(data) {
	const calls = { register: 0, update: 0, unregister: 0 }
	return {
		calls,
		registerGeom(c) {
			calls.register++
			this.lastConfig = c
			return 'geom-0'
		},
		updateGeom() {
			calls.update++
		},
		unregisterGeom() {
			calls.unregister++
		},
		geomData: () => data
	}
}

describe('GeomState', () => {
	const data = [{ x: 1 }, { x: 2 }]

	it('marks are empty until register() sets an id', () => {
		const plot = fakePlot(data)
		const g = new GeomState(plot, () => ({
			type: 'point',
			channels: { x: 'x' },
			build: ({ data }) => data.map((d) => ({ ...d, marked: true }))
		}))
		expect(g.marks).toEqual([])
		expect(plot.calls.register).toBe(0)
	})

	it('register() registers the geom and marks call build with the geom data', () => {
		const plot = fakePlot(data)
		const g = new GeomState(plot, () => ({
			type: 'point',
			channels: { x: 'x' },
			build: ({ data }) => data.map((d) => ({ ...d, marked: true }))
		}))
		g.register()
		expect(plot.calls.register).toBe(1)
		expect(plot.lastConfig.type).toBe('point')
		expect(g.marks).toHaveLength(2)
		expect(g.marks[0].marked).toBe(true)
	})

	it('build receives plot + channels + options + alpha + type', () => {
		const plot = fakePlot(data)
		let received
		const g = new GeomState(plot, () => ({
			type: 'bar',
			channels: { x: 'x' },
			options: { stack: true },
			alpha: 0.5,
			build: (ctx) => {
				received = ctx
				return []
			}
		}))
		g.register()
		void g.marks
		expect(received.plot).toBe(plot)
		expect(received.channels).toEqual({ x: 'x' })
		expect(received.options).toEqual({ stack: true })
		expect(received.alpha).toBe(0.5)
		expect(received.type).toBe('bar')
	})

	it('destroy() unregisters', () => {
		const plot = fakePlot(data)
		const g = new GeomState(plot, () => ({ type: 'point', channels: {}, build: () => [] }))
		g.register()
		g.destroy()
		expect(plot.calls.unregister).toBe(1)
	})
})
