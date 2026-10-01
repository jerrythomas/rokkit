/* The dual arc demos' HOST side (#169). The library computes no history: the metrics script
 * counted shared commits, and the demo flags a pair `hidden` when no import joins it. The spec
 * checks that flag against the imports themselves, so the vermillion arcs are honest.
 */
import { describe, it, expect } from 'vitest'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import { registry } from '../../src/lib/koan/demos/graph/registry'
import { normalizeGraph, arcs } from '@rokkit/graph'

type Edge = { source: string; target: string; overlay?: boolean; hidden?: boolean }

describe('rokkit’s imports against its shared commits', () => {
	const data = datasets.arcs
	const edges = data.edges as Edge[]
	const imports = edges.filter((e) => !e.overlay)
	const commits = edges.filter((e) => e.overlay)
	const joined = (a: string, b: string) =>
		imports.some((i) => (i.source === a && i.target === b) || (i.source === b && i.target === a))

	it('flags a co-change pair hidden exactly when no import joins it, either way', () => {
		expect(commits.length).toBeGreaterThan(0)
		for (const c of commits) expect(Boolean(c.hidden), `${c.source}~${c.target}`).toBe(!joined(c.source, c.target))
		expect(commits.some((c) => c.hidden)).toBe(true)
	})

	it('is about the ~50 items the issue sizes it for, one row each', () => {
		const r = arcs(normalizeGraph(data.nodes, data.edges, data.fields), {})
		expect(r.clusters.length).toBeGreaterThan(40)
		expect(r.clusters.length).toBeLessThanOrEqual(60)
		expect(new Set(r.clusters.map((c) => c.y)).size).toBe(r.clusters.length)
	})

	it('puts the imports left and the shared commits right', () => {
		const r = arcs(normalizeGraph(data.nodes, data.edges, data.fields), {})
		expect(r.edges.filter((e) => e.overlay).every((e) => e.side === 'above')).toBe(true)
		expect(r.edges.filter((e) => !e.overlay).every((e) => e.side === 'below')).toBe(true)
	})
})

describe('the issue’s sample', () => {
	it('sends #169’s items and relations verbatim, split by `set`', () => {
		const data = datasets['arcs-sample']
		const config = registry['arcs-sample']
		const r = arcs(normalizeGraph(data.nodes, data.edges, data.fields), { above: config.props?.above as string })
		expect(r.clusters.map((c) => c.name)).toEqual(['resolve.rs', 'walk.rs', 'fqn.rs', 'persist.rs'])
		expect(r.edges.filter((e) => e.side === 'above')).toHaveLength(3)
		expect(r.edges.filter((e) => e.hidden).map((e) => e.toKey)).toEqual(['file:persist'])
	})
})
