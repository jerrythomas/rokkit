/* #164 — the containment views carry a share per box when `shadeBy` names a measure. */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../../src/model/normalize.js'
import { world } from '../../src/layout/world.js'
import { sunburst } from '../../src/layout/sunburst.js'
import { LAYOUT_OPTIONS } from '../../src/layout/options.js'

const files = [
	{ id: 'a', path: ['ui', 'a'], measures: { size: 30, tested: 1 } },
	{ id: 'b', path: ['ui', 'b'], measures: { size: 10, tested: 0 } },
	{ id: 'c', path: ['core', 'c'], measures: { size: 5 } },
	// Two children, or `core` would fold away — a wrapper is not a level.
	{ id: 'd', path: ['core', 'd'], measures: { size: 5 } }
]
const model = () => normalizeGraph(files, [], {})
/** A container by its name, a leaf by its node id. */
const byName = (clusters: { name: string; nodeId?: string }[], name: string) =>
	clusters.find((c) => c.nodeId === name || c.name === name) as never as { shade?: number; missing?: string[] }

describe.each([
	['world', world],
	['sunburst', sunburst]
] as const)('%s', (_name, layout) => {
	it('gives each box its share, a container the size-weighted mean of what it holds', () => {
		const r = layout(model(), { sizeBy: 'size', shadeBy: 'tested', levels: 2 })
		expect(byName(r.clusters, 'a').shade).toBe(1)
		expect(byName(r.clusters, 'ui').shade).toBe(0.75)
	})

	it('marks a box with nothing measured as missing its shade — not as a zero', () => {
		const r = layout(model(), { sizeBy: 'size', shadeBy: 'tested', levels: 2 })
		expect(byName(r.clusters, 'core')).toMatchObject({ missing: ['color'] })
		expect(byName(r.clusters, 'core').shade).toBeUndefined()
	})

	it('shades nothing, and marks nothing, without shadeBy', () => {
		const r = layout(model(), { sizeBy: 'size', levels: 2 })
		expect(r.clusters.every((c) => c.shade === undefined && c.missing === undefined)).toBe(true)
	})

	it('lists shadeBy as one of its options', () => {
		expect(LAYOUT_OPTIONS[_name]).toContain('shadeBy')
	})
})
