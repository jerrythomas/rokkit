/* The legend — what the colours and strokes on the canvas actually mean.
 *
 * Graph-native rather than `@rokkit/chart`'s: that package carries eight d3 modules plus
 * ramda, and `@rokkit/graph` has exactly one dependency. The swatch vocabulary differs too —
 * a chart swatch is a symbol path, a graph swatch is a kind ICON or a LINE STYLE. If the
 * generic legend is ever promoted into a package both can share, this is what it replaces.
 */

import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render } from '@testing-library/svelte'
import GraphLegend from '../src/GraphLegend.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

const NODES = [
	{ id: 'a', label: 'users', kind: 'table', group: 'public' },
	{ id: 'b', label: 'v_orders', kind: 'view', group: 'billing' },
	{ id: 'c', label: 'audit_fn', kind: 'function', group: 'billing' }
]
const EDGES = [
	{ source: 'b', target: 'a', kind: 'dependency', relation: 'reads' },
	{ source: 'c', target: 'a', kind: 'dependency', relation: 'writes' }
]

const state = (config = {}) =>
	new GraphState({ nodes: NODES, edges: EDGES, fields: {}, ...config })

describe('GraphLegend', () => {
	it('lists the node kinds actually PRESENT, not the whole vocabulary', () => {
		// A legend naming eight kinds over a diagram with three is a key to a different
		// picture — the reader hunts for a `trigger` that is not there.
		const { container } = render(GraphLegend, { state: state(), kinds: true })
		const entries = [...container.querySelectorAll('[data-legend-kind]')].map((el) =>
			el.getAttribute('data-legend-kind')
		)

		expect(entries.sort()).toEqual(['function', 'table', 'view'])
	})

	it('gives each kind its icon, which is the swatch a graph legend needs', () => {
		const { container } = render(GraphLegend, { state: state(), kinds: true })
		const icon = container.querySelector('[data-legend-kind="table"] [data-legend-swatch]')

		expect(icon?.className).toContain('i-')
	})

	it('lists the edge relations present, drawn as the stroke they use', () => {
		const { container } = render(GraphLegend, { state: state(), relations: true })
		const entries = [...container.querySelectorAll('[data-legend-relation]')].map((el) =>
			el.getAttribute('data-legend-relation')
		)

		expect(entries.sort()).toEqual(['reads', 'writes'])
	})

	it('falls back to the edge KIND when a producer names no verb', () => {
		// A plain foreign key has no relation. Listing nothing would leave the one stroke on
		// the canvas unexplained.
		const s = new GraphState({
			nodes: NODES,
			edges: [{ source: 'b', target: 'a' }],
			fields: {}
		})
		const { container } = render(GraphLegend, { state: s, relations: true })

		expect(container.querySelector('[data-legend-relation="reference"]')).not.toBeNull()
	})

	it('lists groups with their ramp colour', () => {
		const { container } = render(GraphLegend, { state: state(), groups: true })
		const entries = [...container.querySelectorAll('[data-legend-group]')].map((el) =>
			el.getAttribute('data-legend-group')
		)

		expect(entries.sort()).toEqual(['billing', 'public'])
	})

	it('carries the group ramp on the swatch, so it matches the canvas', () => {
		const { container } = render(GraphLegend, { state: state(), groups: true })
		const swatch = container.querySelector(
			'[data-legend-group="public"] [data-legend-swatch]'
		) as HTMLElement

		expect(swatch.style.getPropertyValue('--group-fill')).not.toBe('')
	})

	it('shows nothing at all when no section is asked for', () => {
		// Opt-in per section: a diagram whose kinds are all identical wants the relations key
		// and nothing else.
		const { container } = render(GraphLegend, { state: state() })

		expect(container.querySelector('[data-graph-legend]')).toBeNull()
	})

	it('reports the entry a reader clicked, so a caller can filter on it', async () => {
		let picked: { section: string; value: string } | undefined
		const { container } = render(GraphLegend, {
			state: state(),
			kinds: true,
			onpick: (section: string, value: string) => (picked = { section, value })
		})

		;(container.querySelector('[data-legend-kind="view"]') as HTMLElement).click()
		await tick()
		expect(picked).toEqual({ section: 'kind', value: 'view' })
	})

	it('is inert when no handler is given — a static key is not a button', () => {
		const { container } = render(GraphLegend, { state: state(), kinds: true })

		expect(container.querySelector('[data-legend-kind="table"]')?.tagName).not.toBe('BUTTON')
	})

	it('is a button when it IS interactive, so it is reachable by keyboard', () => {
		const { container } = render(GraphLegend, {
			state: state(),
			kinds: true,
			onpick: () => {}
		})

		expect(container.querySelector('[data-legend-kind="table"]')?.tagName).toBe('BUTTON')
	})
})
