import { describe, it, expect } from 'vitest'
import { cluster, layouts, neighborhood, points } from '../../src/layout/index.js'
import { normalizeGraph } from '../../src/model/normalize.js'

describe('layout registry', () => {
	it('registers exactly the built-in layouts', () => {
		expect(Object.keys(layouts).sort()).toEqual(['cluster', 'flow', 'neighborhood', 'points', 'world'])
	})

	it('maps each name to the layout of that name, not merely to some layout', () => {
		// `{ cluster, cluster }` or a copy-paste that registers cluster twice still satisfies
		// a key check and a callable check. Identity is what catches it, and the consequence
		// is silent: `layout="neighborhood"` would render a cluster diagram.
		expect(layouts.cluster).toBe(cluster)
		expect(layouts.neighborhood).toBe(neighborhood)
		expect(layouts.points).toBe(points)
	})

	it('gives every registered layout the LayoutFn contract', () => {
		const model = normalizeGraph([{ id: 'a', label: 'a', rows: [] }], [], {})

		expect(Object.keys(layouts).length).toBeGreaterThan(0)
		for (const [name, layout] of Object.entries(layouts)) {
			const result = layout(model, { focus: 'a' })

			expect(result, name).toMatchObject({
				clusters: expect.any(Array),
				cards: expect.any(Object),
				edges: expect.any(Array),
				size: { w: expect.any(Number), h: expect.any(Number) }
			})
		}
	})
})
