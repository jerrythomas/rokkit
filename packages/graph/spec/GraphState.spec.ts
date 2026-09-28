/* Every derivation in the package is covered here, and NOTHING in this file renders.
   That is the point of the layer: geometry, badge derivation and selection logic are
   provable without a DOM, which leaves the component specs free to assert only attributes. */

import { describe, it, expect, vi } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import type { GraphStateConfig } from '../src/GraphState.svelte.js'
import { createGraphPreset } from '../src/preset.js'
import type { GraphFields } from '../src/types.js'

const FIELDS: GraphFields = {
	label: 'name',
	group: 'schema',
	kind: 'kind',
	rows: 'columns',
	rowBadges: { pk: 'pk' },
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c'
}

const NODES = [
	{
		schema: 'public',
		name: 'users',
		kind: 'table',
		noteMd: 'People',
		columns: [{ name: 'id', type: 'uuid', pk: true }]
	},
	{ schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] },
	{ schema: 'audit', name: 'log', kind: 'table', columns: [{ name: 'id', type: 'uuid', pk: true }] }
]

const EDGES = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const make = (config: Partial<GraphStateConfig> = {}) =>
	new GraphState({ nodes: NODES, edges: EDGES, fields: FIELDS, ...config })

describe('GraphState — model', () => {
	it('normalizes nodes and edges on construction', () => {
		const state = make()

		expect(state.model.nodes).toHaveLength(3)
		expect(state.model.edges).toHaveLength(1)
	})

	it('exposes the node ids it laid out', () => {
		expect(Object.keys(make().cards).sort()).toEqual(['audit.log', 'public.orders', 'public.users'])
	})

	it('re-normalizes when nodes change through update', () => {
		const state = make()
		state.update({ nodes: [NODES[0]], edges: [], fields: FIELDS })

		expect(state.model.nodes).toHaveLength(1)
	})

	// update() follows SparkState (unconditional reassign), NOT PlotState (which guards 15
	// fields with `if (config.X !== undefined)` and therefore merges). EVERY field gets its own
	// revert case: a lone `density` assertion passes against an implementation that merged the
	// other nine — which is exactly the PlotState pattern an implementer might copy.
	const revertCases: [string, Partial<GraphStateConfig>, (s: GraphState) => unknown, unknown][] = [
		['density', { density: 'full' }, (s) => s.density, 'keys'],
		['arrange', { arrange: 'a-z' }, (s) => s.arrange, 'untangle'],
		['edgeStyle', { edgeStyle: 'orthogonal' }, (s) => s.edgeStyle, 'curved'],
		['mode', { mode: 'dark' }, (s) => s.mode, 'light'],
		['layout', { layout: 'neighborhood' }, (s) => s.layoutName, 'cluster']
	]

	it.each(revertCases)(
		'update() reverts %s to its default when the key is omitted',
		(_name, seed, read, expected) => {
			const state = make(seed)
			state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

			expect(read(state)).toBe(expected)
		}
	)

	it('update() reverts preset to the default when omitted', () => {
		const state = make({ preset: createGraphPreset({ using: 'pattern' }) })
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

		expect(state.groupStyle('public')).toHaveProperty('--group-fill')
	})

	it('update() reverts label to the data-derived name when omitted', () => {
		const state = make({ label: 'Custom' })
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

		expect(state.label).not.toBe('Custom')
	})

	it('update() reverts focus when omitted', () => {
		const state = make({ layout: 'neighborhood', focus: 'public.users' })
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, layout: 'neighborhood' })

		expect(state.cards).toEqual({})
	})

	it('update() drops onselect when omitted', () => {
		const onselect = vi.fn()
		const state = make({ onselect })
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })
		state.select('public.users')

		expect(onselect).not.toHaveBeenCalled()
	})

	it('update() does NOT reset value — it is input and output both', () => {
		// The documented exception. An unconditional reset would wipe a selection the user
		// just made, on every re-render.
		const state = make()
		state.select('public.users')
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS })

		expect(state.value).toBe('public.users')
	})

	it('update() DOES adopt an explicitly supplied value', () => {
		// The other side of the exception: a bound prop must still be able to drive selection.
		const state = make()
		state.select('public.users')
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, value: 'audit.log' })

		expect(state.value).toBe('audit.log')
	})

	it('update() accepts an explicit null value to clear the selection', () => {
		const state = make()
		state.select('public.users')
		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, value: null })

		expect(state.value).toBeNull()
	})
})

describe('GraphState — layout', () => {
	it('defaults to the cluster layout', () => {
		expect(
			make()
				.clusters.map((c) => c.name)
				.sort()
		).toEqual(['audit', 'public'])
	})

	it('resolves a layout named as a string', () => {
		const state = make({ layout: 'neighborhood', focus: 'public.users' })

		expect(state.clusters).toEqual([])
	})

	it('accepts a LayoutFn directly', () => {
		const state = make({
			layout: () => ({ clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } })
		})

		expect(state.cards).toEqual({})
	})

	it('falls back to cluster for an unknown layout name', () => {
		expect(make({ layout: 'nope' }).clusters).toHaveLength(2)
	})

	it('recomputes the layout when density changes', () => {
		const state = make({ density: 'names' })
		const short = state.cards['public.users'].h

		state.update({ nodes: NODES, edges: EDGES, fields: FIELDS, density: 'full' })
		expect(state.cards['public.users'].h).toBeGreaterThan(short)
	})

	it('falls back to the selection when no explicit focus is given', () => {
		// `focus` defaults to `value`, so selecting a node is enough to drive a
		// neighbourhood view without the consumer wiring a second prop.
		const state = make({ layout: 'neighborhood' })
		state.select('public.users')

		expect(Object.keys(state.cards)).toContain('public.users')
	})

	it('exposes the canvas size', () => {
		expect(make().size.w).toBeGreaterThan(0)
	})

	it('reports a content extent tighter than size, since size adds a right/bottom margin', () => {
		// A pure max over clusters — no viewport, so it is state's job and testable with no DOM.
		const state = make()

		expect(state.contentSize.w).toBeLessThan(state.size.w)
		expect(state.contentSize.h).toBeLessThan(state.size.h)
	})

	it('falls back to card bounds for an ungrouped layout that reports no clusters', () => {
		const state = make({ layout: 'neighborhood', focus: 'public.users' })

		expect(state.clusters).toEqual([])
		expect(state.contentSize.w).toBeGreaterThan(0)
	})

	it('falls back to size when there is nothing laid out at all', () => {
		const state = new GraphState({ nodes: [], edges: [], fields: FIELDS })

		expect(state.contentSize).toEqual(state.size)
	})

	it('exposes routed edges', () => {
		expect(make().routedEdges).toHaveLength(1)
	})

	it('builds an SVG path per edge at the configured edge style', () => {
		const curved = make({ edgeStyle: 'curved' })
		const orthogonal = make({ edgeStyle: 'orthogonal' })

		expect(curved.edgePath(curved.routedEdges[0])).not.toBe(
			orthogonal.edgePath(orthogonal.routedEdges[0])
		)
	})
})

describe('GraphState — group styles', () => {
	it('resolves a style per group', () => {
		const state = make()

		expect(state.groupStyle('public')).toHaveProperty('--group-fill')
		expect(state.groupStyle('audit')).toHaveProperty('--group-fill')
	})

	it('gives two groups different fills', () => {
		const state = make()

		expect(state.groupStyle('public')['--group-fill']).not.toBe(
			state.groupStyle('audit')['--group-fill']
		)
	})

	it('returns an empty style object for an unknown group', () => {
		expect(make().groupStyle('nope')).toEqual({})
	})

	it('returns an empty style object for an undefined group', () => {
		// An ungrouped node passes `undefined` straight through from the template.
		expect(make().groupStyle(undefined)).toEqual({})
	})

	it('serialises a group style into a style attribute string', () => {
		// The template cannot spread an object into `style`, so something has to build the
		// string. Doing it inline meant the same map/join in two places in Graph.svelte and
		// a derivation living in a component — here it is one function with a test.
		const state = make()
		const attr = state.groupStyleAttr('public')

		expect(attr).toContain('--group-fill:')
		expect(attr.split(';')).toHaveLength(Object.keys(state.groupStyle('public')).length)
	})

	it('serialises an unknown group to an empty string, not ";" noise', () => {
		expect(make().groupStyleAttr('nope')).toBe('')
	})

	it('switches to patterns when the preset says using: pattern', () => {
		const state = make({ preset: createGraphPreset({ using: 'pattern' }) })

		expect(state.groupStyle('public')).toHaveProperty('--group-pattern')
	})

	it('picks dark-mode shades when mode is dark', () => {
		const light = make({ mode: 'light' }).groupStyle('public')
		const dark = make({ mode: 'dark' }).groupStyle('public')

		expect(light['--group-fill']).not.toBe(dark['--group-fill'])
	})
})

describe('GraphState — selection', () => {
	it('starts with nothing selected', () => {
		expect(make().value).toBeNull()
	})

	it('select() sets the value', () => {
		const state = make()
		state.select('public.users')

		expect(state.value).toBe('public.users')
	})

	it('clear() unsets it', () => {
		const state = make()
		state.select('public.users')
		state.clear()

		expect(state.value).toBeNull()
	})

	it('calls onselect when select() runs', () => {
		const onselect = vi.fn()
		make({ onselect }).select('public.users')

		expect(onselect).toHaveBeenCalledWith('public.users')
	})

	it('reports related node ids for the selection', () => {
		const state = make()
		state.select('public.users')

		expect([...state.related]).toEqual(['public.orders'])
	})

	it('reports an empty related set with nothing selected', () => {
		expect(make().related.size).toBe(0)
	})

	it('reports an empty related set for a node with no neighbours', () => {
		const state = make()
		state.select('audit.log')

		expect(state.related.size).toBe(0)
	})

	it('expands one node to full rows without touching the others', () => {
		// Per NODE, not a global density change: clicking "+3 more" on one card asks about
		// that card, and expanding every card answers a question nobody asked.
		const state = make({ density: 'names' })
		const before = state.cards['public.users'].vis.length
		state.toggleExpanded('public.users')

		expect(state.isExpanded('public.users')).toBe(true)
		expect(state.cards['public.users'].vis.length).toBeGreaterThan(before)
		expect(state.cards['public.orders'].vis).toHaveLength(0)
	})

	it('collapses again on a second toggle', () => {
		const state = make({ density: 'names' })
		state.toggleExpanded('public.users')
		state.toggleExpanded('public.users')

		expect(state.isExpanded('public.users')).toBe(false)
		expect(state.cards['public.users'].vis).toHaveLength(0)
	})

	it('reports nothing expanded to begin with', () => {
		expect(make().isExpanded('public.users')).toBe(false)
	})

	it('nodeState returns null with nothing selected', () => {
		expect(make().nodeState('public.users')).toBeNull()
	})

	it('nodeState marks the selection, its neighbours, and everything else', () => {
		const state = make()
		state.select('public.users')

		expect(state.nodeState('public.users')).toBe('selected')
		expect(state.nodeState('public.orders')).toBe('related')
		expect(state.nodeState('audit.log')).toBe('dim')
	})

	it('edgeState returns null with nothing selected', () => {
		const state = make()

		expect(state.edgeState(state.routedEdges[0])).toBeNull()
	})

	it('edgeState highlights an edge touching the selection', () => {
		const state = make()
		state.select('public.users')

		expect(state.edgeState(state.routedEdges[0])).toBe('highlight')
	})

	it('edgeState dims an edge that does not touch the selection', () => {
		const state = make()
		state.select('audit.log')

		expect(state.edgeState(state.routedEdges[0])).toBe('dim')
	})
})

describe('GraphState — entity derivations', () => {
	it('exposes one entity row per node, with row and ref counts', () => {
		const state = make()
		const users = state.entities.find((e) => e.id === 'public.users')

		expect(users).toMatchObject({
			label: 'users',
			group: 'public',
			kind: 'table',
			rowCount: 1,
			refCount: 1
		})
	})

	it('counts references in both directions', () => {
		const state = make()

		expect(state.entities.find((e) => e.id === 'public.orders')?.refCount).toBe(1)
	})

	it('reports zero refs for an unreferenced node', () => {
		expect(make().entities.find((e) => e.id === 'audit.log')?.refCount).toBe(0)
	})

	it('exposes the focused entity', () => {
		const state = make()
		state.select('public.users')

		expect(state.entity?.label).toBe('users')
	})

	it('exposes no entity when nothing is selected', () => {
		expect(make().entity).toBeNull()
	})

	it('exposes no entity for an unknown id', () => {
		const state = make()
		state.select('public.ghost')

		expect(state.entity).toBeNull()
	})

	it('partitions relationships into inbound and outbound', () => {
		const state = make()
		state.select('public.users')

		expect(state.relationships).toEqual([
			{
				direction: 'in',
				id: 'public.orders',
				label: 'orders',
				group: 'public',
				edge: expect.anything(),
				routed: expect.anything()
			}
		])
	})

	it('reports an outbound relationship from the other side', () => {
		const state = make()
		state.select('public.orders')

		expect(state.relationships[0].direction).toBe('out')
	})

	it('reports no relationships when nothing is selected', () => {
		// Relationships are relative to the selection, so with none there is nothing to
		// describe — the panel renders empty rather than listing every edge in the model.
		expect(make().relationships).toEqual([])
	})

	it('reports no relationships for an unconnected node', () => {
		const state = make()
		state.select('audit.log')

		expect(state.relationships).toEqual([])
	})

	it('reports a self-reference once, as outbound', () => {
		const selfEdge = [
			{ from: { s: 'public', t: 'users', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }
		]
		const state = make({ edges: selfEdge })
		state.select('public.users')

		expect(state.relationships).toHaveLength(1)
		expect(state.relationships[0]).toMatchObject({ direction: 'out', id: 'public.users' })
	})

	it('reports relationships the ACTIVE LAYOUT did not place', () => {
		// `focus` and `value` are independent, so a neighbourhood layout centred elsewhere lays
		// out none of the selection's edges. Deriving relationships from the layout's edges would
		// make the state contradict itself — see the #relationships doc comment.
		const state = make({ layout: 'neighborhood', focus: 'audit.log' })
		state.select('public.orders')

		expect(state.relationships).toHaveLength(1)
		expect(state.relationships[0].id).toBe('public.users')
	})

	it('never disagrees with refCount about whether a node has relationships', () => {
		const state = make({ layout: 'neighborhood', focus: 'audit.log' })

		for (const entity of state.entities) {
			state.select(entity.id)
			expect(state.relationships.length, entity.id).toBe(entity.refCount)
		}
	})

	it('omits routed geometry for an edge the layout did not place', () => {
		const state = make({ layout: 'neighborhood', focus: 'audit.log' })
		state.select('public.orders')

		expect(state.relationships[0].edge).toBeDefined()
		expect(state.relationships[0].routed).toBeUndefined()
	})

	it('attaches routed geometry when the layout did place the edge', () => {
		const state = make()
		state.select('public.orders')

		expect(state.relationships[0].routed).toBeDefined()
	})

	it('resolves every relationship to a known node', () => {
		// normalizeGraph drops edges whose endpoints do not resolve, so both ends of every
		// model edge are in byId. That invariant is what lets `describe` read the node
		// without a fallback — assert it holds rather than carrying dead defensive code.
		const state = make()

		for (const entity of state.entities) {
			state.select(entity.id)
			for (const rel of state.relationships) {
				expect(state.model.byId.has(rel.id), rel.id).toBe(true)
				expect(rel.label).toBe(state.model.byId.get(rel.id)?.label)
			}
		}
	})
})

describe('GraphState — accessible name', () => {
	it('uses an explicit label when given', () => {
		expect(make({ label: 'Schema diagram' }).label).toBe('Schema diagram')
	})

	it('derives a name from the data when no label is given', () => {
		const label = make().label

		expect(label).toContain('3')
		expect(label).toContain('1')
	})

	it('pluralises the derived name correctly', () => {
		// A screen reader reads this verbatim, so "1 relationships" is a defect, not a nit.
		expect(make().label).toBe('Diagram of 3 nodes and 1 relationship')
		expect(new GraphState({ nodes: [NODES[0]], edges: [], fields: FIELDS }).label).toBe(
			'Diagram of 1 node and 0 relationships'
		)
	})
})

describe('GraphState — edges', () => {
	it('handles an empty model without throwing', () => {
		const state = new GraphState({ nodes: [], edges: [], fields: FIELDS })

		expect(state.cards).toEqual({})
		expect(state.clusters).toEqual([])
		expect(state.entities).toEqual([])
		expect(state.label).toContain('0')
	})

	it('survives construction with no config at all', () => {
		expect(() => new GraphState()).not.toThrow()
	})
})
