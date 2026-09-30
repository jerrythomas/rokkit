import { describe, it, expect } from 'vitest'
import { flushSync } from 'svelte'
import { GeomRegistry } from '../../src/state/GeomRegistry.svelte.js'

const rows = [
	{ g: 'a', v: 1 },
	{ g: 'a', v: 3 },
	{ g: 'b', v: 5 }
]
/** A source the registry reads its rows and container channels from. */
const source = (over = {}) => ({ data: rows, channels: { x: 'g', y: 'v' }, helpers: {}, ...over })

describe('GeomRegistry — lifecycle', () => {
	it('registers with a prefixed, unique id and lists the geom', () => {
		const r = new GeomRegistry(source(), 'test')
		const a = r.register({ type: 'bar', channels: {} })
		const b = r.register({ type: 'line', channels: {} })
		expect(a).toMatch(/^test-/)
		expect(a).not.toBe(b)
		expect(r.list.map((g) => g.type)).toEqual(['bar', 'line'])
		expect([...r.types].sort()).toEqual(['bar', 'line'])
	})

	it('updates in place and unregisters', () => {
		const r = new GeomRegistry(source(), 'test')
		const id = r.register({ type: 'bar', channels: {}, stat: 'identity' })
		r.update(id, { stat: 'sum' })
		expect(r.list[0].stat).toBe('sum')
		r.unregister(id)
		expect(r.list).toEqual([])
	})

	it('first is the first registered geom, or undefined', () => {
		const r = new GeomRegistry(source(), 'test')
		expect(r.first).toBeUndefined()
		r.register({ type: 'hull', channels: {} })
		r.register({ type: 'point', channels: {} })
		expect(r.first.type).toBe('hull')
		expect(r.find((g) => g.type === 'point')?.type).toBe('point')
	})
})

describe('GeomRegistry — geomData', () => {
	it('returns the source rows themselves for identity — geoms look rows up by indexOf', () => {
		const r = new GeomRegistry(source(), 'test')
		const id = r.register({ type: 'point', channels: {} })
		expect(r.data(id)).toBe(rows)
	})

	it('aggregates with the geom’s stat, inheriting the container channels', () => {
		const r = new GeomRegistry(source(), 'test')
		const id = r.register({ type: 'bar', channels: {}, stat: 'sum' })
		expect(r.data(id).map((d) => d.v)).toEqual([4, 5])
	})

	it('an explicit undefined channel inherits instead of clobbering the container’s', () => {
		// Geom components pass every channel key; `{ x: undefined }` must not erase x.
		const r = new GeomRegistry(source(), 'test')
		const id = r.register({ type: 'bar', channels: { x: undefined, y: undefined }, stat: 'sum' })
		expect(r.data(id).map((d) => d.g)).toEqual(['a', 'b'])
	})

	it('passes helpers to custom stats', () => {
		const helpers = { stats: { twice: (values) => values.reduce((s, v) => s + v, 0) * 2 } }
		const r = new GeomRegistry(source({ helpers }), 'test')
		const id = r.register({ type: 'bar', channels: {}, stat: 'twice' })
		expect(r.data(id).map((d) => d.v)).toEqual([8, 10])
	})

	it('returns no rows for an unknown id', () => {
		expect(new GeomRegistry(source(), 'test').data('nope')).toEqual([])
	})

	it('update() from inside an effect does not make the effect track the list', () => {
		// GeomState.sync calls update() from a geom's $effect. Reading the list tracked would
		// re-run that effect on its own write: effect_update_depth_exceeded.
		const r = new GeomRegistry(source(), 'test')
		const id = r.register({ type: 'bar', channels: {} })
		let runs = 0
		const cleanup = $effect.root(() => {
			$effect(() => {
				runs++
				r.update(id, { stat: 'identity' })
			})
		})
		flushSync()
		expect(runs).toBe(1)
		cleanup()
	})
})
