/* The shaded treemap demo (#164): this repo's packages sized by declarations and shaded by how
 * much of them sits in a file a spec names — a share the build script records per file.
 */
import { describe, it, expect } from 'vitest'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import { registry } from '../../src/lib/koan/demos/graph/registry'
import { normalizeGraph, world } from '@rokkit/graph'

describe('the tested-share treemap', () => {
	const config = registry['treemap-tested']

	it('is a treemap of this codebase, shaded by the tested share', () => {
		expect(config).toMatchObject({ layout: 'world', dataset: 'codebase' })
		expect(config.props).toMatchObject({ sizeBy: 'declarations', shadeBy: 'tested' })
	})

	it('gives the packages a real spread of shares, all inside 0..1', () => {
		const data = datasets[config.dataset]
		const r = world(normalizeGraph(data.nodes, data.edges, data.fields), config.props as never)
		const shades = r.clusters.map((c) => c.shade).filter((s): s is number => s !== undefined)
		expect(shades.length).toBeGreaterThan(5)
		expect(shades.every((s) => s >= 0 && s <= 1)).toBe(true)
		expect(Math.max(...shades) - Math.min(...shades)).toBeGreaterThan(0.3)
	})
})
