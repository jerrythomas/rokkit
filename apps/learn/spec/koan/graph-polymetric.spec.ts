/* The polymetric demo's HOST side (#168): rokkit's own core package as a containment tree sent
 * the way many hosts send one — `parent` ids, not paths — with each file carrying the three
 * measures the boxes encode. The library computes none of them; the metrics script did.
 */
import { describe, it, expect } from 'vitest'
import architecture from '../../src/lib/koan/demos/chart/architecture.json'
import { filesWithParents } from '../../src/lib/koan/demos/graph/polymetric'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import { registry } from '../../src/lib/koan/demos/graph/registry'
import { normalizeGraph, polymetric } from '@rokkit/graph'

const graphFiles = architecture.modules.filter((m) => m.package === 'core')

describe('filesWithParents', () => {
	const nodes = filesWithParents(architecture.modules, 'core')
	const byId = new Map(nodes.map((n) => [n.id, n]))

	it('sends every file of the package once, with its measures', () => {
		const files = nodes.filter((n) => n.kind === 'file')
		expect(files.map((f) => f.id).sort()).toEqual(graphFiles.map((m) => m.id).sort())
		const one = graphFiles[0]
		expect(byId.get(one.id)?.measures).toEqual({
			declarations: one.declarations,
			loc: one.loc,
			churn: one.churn
		})
	})

	it('declares each folder once, and every chain of parents ends at the package', () => {
		const ids = nodes.map((n) => n.id)
		expect(new Set(ids).size).toBe(ids.length)
		for (const node of nodes) {
			let at: (typeof nodes)[number] | undefined = node
			while (at?.parent) at = byId.get(at.parent)
			expect(at?.id, node.id).toBe('packages/core')
		}
	})

	it('names a folder by its last segment', () => {
		expect(byId.get('packages/core/src/colors')).toMatchObject({ label: 'colors', kind: 'folder', parent: 'packages/core/src' })
		expect(byId.get('packages/core')).toMatchObject({ label: 'core', parent: null })
	})
})

describe('the polymetric demo', () => {
	it('draws a box per file, with the channels on the measures #168 names', () => {
		const data = datasets.polymetric
		const config = registry.polymetric
		const r = polymetric(normalizeGraph(data.nodes, data.edges, data.fields), {
			widthBy: config.props.widthBy as string,
			heightBy: config.props.heightBy as string,
			colorBy: config.props.colorBy as string
		})
		// Only a leaf box carries a nodeId; a folder is a container label.
		expect(r.clusters.filter((c) => c.nodeId).map((c) => c.nodeId).sort()).toEqual(graphFiles.map((m) => m.id).sort())
		expect(r.channels).toMatchObject({
			width: { measure: 'declarations' },
			height: { measure: 'loc' },
			color: { measure: 'churn' }
		})
	})
})

