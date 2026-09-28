import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import meta from '../../src/lib/koan/demos/graph/meta'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import type { DatasetId } from '../../src/lib/koan/demos/graph/datasets'
import { normalizeGraph } from '@rokkit/graph'
import chartMeta from '../../src/lib/koan/demos/chart/meta'

// cwd is the REPO ROOT even for the `learn` project, which is why this is not `../../`.
// Same convention as packages/themes/spec/graph-css.spec.js.
const css = ['base', 'rokkit']
	.map((style) =>
		readFileSync(join(process.cwd(), `packages/themes/src/${style}/graph.css`), 'utf-8')
	)
	.join('\n')

/**
 * `data-style` is the theme's own scoping attribute — it prefixes every rule in every
 * rokkit/*.css and is not a component hook, so it is not part of the override contract.
 */
const NOT_A_HOOK = new Set([
	'data-style',
	// A generic selected-state marker shared across the design system's controls, not a
	// graph-specific hook — documenting it here would imply it is ours.
	'data-selected'
])

describe('graph demo meta', () => {
	it('publishes every data-attribute the theme CSS targets', () => {
		const inCss = new Set(
			[...css.matchAll(/\[data-([a-z-]+)/g)]
				.map((m) => `data-${m[1]}`)
				.filter((a) => !NOT_A_HOOK.has(a))
		)
		const documented = new Set(
			meta.api!.attrs!.flatMap((a) => [...a.selector.matchAll(/data-[a-z-]+/g)].map((m) => m[0]))
		)

		expect(inCss.size).toBeGreaterThan(20)
		expect([...inCss].filter((a) => !documented.has(a))).toEqual([])
	})

	it('documents the theming attributes specifically, not just the structural ones', () => {
		// Sourcing the list from base/graph.css alone would omit exactly the attributes a
		// consumer comes for: these are colour-keyed, so by the headless-base rule they appear
		// only in rokkit/graph.css.
		const documented = meta.api!.attrs!.map((a) => a.selector).join(' ')

		for (const attr of [
			'data-node-kind',
			'data-node-state',
			'data-node-group',
			'data-edge-kind',
			'data-edge-state',
			'data-row-badge'
		]) {
			expect(documented, attr).toContain(attr)
		}
	})

	it('claims the graph keywords, and the chart demo no longer does', () => {
		expect(meta.keywords).toContain('graph')
		expect(meta.keywords).toContain('graphs')
		expect(chartMeta.keywords).not.toContain('graph')
		expect(chartMeta.keywords).not.toContain('graphs')
	})

	it('ships a runnable snippet for each way in', () => {
		const titles = meta.snippets!.map((s) => s.title)

		expect(titles).toHaveLength(5)
		// The fields-mapped example is the one that proves the contract is not schema-shaped,
		// and the CSS override is the one that proves theming needs no prop.
		expect(meta.snippets!.some((s) => s.code.includes('fields'))).toBe(true)
		expect(meta.snippets!.some((s) => s.lang === 'css')).toBe(true)
	})
})

/* An orphan — a node no edge touches — means the dataset put something in a view whose
   relationships that view does not carry. It is the defect the ER/dependency split exists to
   remove, and it is symmetric: the ER scope must not contain routines, and the dependency
   scope must not contain a node whose only relationships are foreign keys.
   Asserted on the DATA rather than in the browser, because it is a property of the dataset. */
describe('graph demo datasets', () => {
	const orphansIn = (id: DatasetId) => {
		const { nodes, edges, fields } = datasets[id]
		const model = normalizeGraph(nodes, edges, fields)
		const touched = new Set<string>()
		for (const edge of model.edges) {
			// An unplaced end is not a node, so it cannot rescue one from being an orphan.
			if (edge.unplaced !== 'source' && edge.unplaced !== 'both') touched.add(edge.source)
			if (edge.unplaced !== 'target' && edge.unplaced !== 'both') touched.add(edge.target)
		}
		return model.nodes.map((n) => n.id).filter((id) => !touched.has(id))
	}

	it.each(['ecommerce', 'schema-deps', 'service-calls'] as const)(
		'%s leaves no node unconnected',
		(id) => {
			expect(orphansIn(id)).toEqual([])
		}
	)
})
