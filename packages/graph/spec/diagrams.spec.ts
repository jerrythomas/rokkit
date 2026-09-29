/* Named diagrams, the way `@rokkit/chart` has `BarChart` and `LineChart` over one `Plot`.
 *
 * `Graph` is the canvas — it draws whatever a layout hands it and ships no chrome. A diagram
 * is a named composition over it: one layout, the controls that mean something for THAT
 * picture, and an opt-in legend. Each is usable on its own.
 *
 * The thing this replaces: one component with a `layout` prop and every control in a drawer,
 * where a dataset shaped for an ER diagram could be pointed at a radial tree and the controls
 * offered options that did nothing.
 */

import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render } from '@testing-library/svelte'
import ErDiagram from '../src/diagrams/ErDiagram.svelte'
import DependencyDiagram from '../src/diagrams/DependencyDiagram.svelte'
import CallTree from '../src/diagrams/CallTree.svelte'
import Treemap from '../src/diagrams/Treemap.svelte'
import Sunburst from '../src/diagrams/Sunburst.svelte'
import Neighborhood from '../src/diagrams/Neighborhood.svelte'

const TABLES = [
	{ id: 'users', label: 'users', kind: 'table', group: 'public', rows: [{ name: 'id' }] },
	{ id: 'orders', label: 'orders', kind: 'table', group: 'public', rows: [{ name: 'user_id' }] }
]
const REFS = [{ source: 'orders', target: 'users', sourceRow: 'user_id', targetRow: 'id' }]

const TREE = [
	{ id: 'a', label: 'parse', kind: 'function', path: ['dbd', 'core', 'parse'], weight: 40 },
	{ id: 'b', label: 'emit', kind: 'function', path: ['dbd', 'core', 'emit'], weight: 10 },
	{ id: 'c', label: 'render', kind: 'function', path: ['dbd', 'site', 'render'], weight: 25 }
]

const CALLS = [
	{ id: 'a', label: 'checkout', kind: 'function' },
	{ id: 'b', label: 'ledger', kind: 'function' },
	{ id: 'c', label: 'notify', kind: 'function' }
]
const CALL_EDGES = [
	{ source: 'a', target: 'b' },
	{ source: 'a', target: 'c' }
]

const layoutOf = (container: HTMLElement) =>
	container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')

describe('every diagram is a canvas plus its own controls', () => {
	it('ErDiagram draws with the layered flow layout', () => {
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS })

		expect(layoutOf(container)).toBe('flow')
	})

	it('CallTree draws radially — a call graph has a shape', () => {
		const { container } = render(CallTree, { nodes: CALLS, edges: CALL_EDGES })

		expect(layoutOf(container)).toBe('radial')
	})

	it('Treemap draws containment as nested boxes', () => {
		const { container } = render(Treemap, { nodes: TREE, edges: [] })

		expect(layoutOf(container)).toBe('world')
	})

	it('Sunburst draws the same containment as wedges', () => {
		const { container } = render(Sunburst, { nodes: TREE, edges: [] })

		expect(layoutOf(container)).toBe('sunburst')
	})

	it('Neighborhood centres on one node', () => {
		const { container } = render(Neighborhood, {
			nodes: CALLS,
			edges: CALL_EDGES,
			focus: 'a'
		})

		expect(layoutOf(container)).toBe('neighborhood')
	})
})

describe('a diagram offers only the controls that mean something for it', () => {
	it('gives the ER diagram density and edge style, but not depth', () => {
		// Depth caps a containment tree. An ER diagram has no tree, so the control would move
		// and the picture would not.
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS, controls: true })

		expect(container.querySelector('[data-graph-density-controls]')).not.toBeNull()
		expect(container.querySelector('[data-graph-edge-style]')).not.toBeNull()
		expect(container.querySelector('[data-graph-depth-controls]')).toBeNull()
	})

	it('gives the treemap depth, but not density or edge style', () => {
		// A box has no row list to thin, and containment draws no edges at all.
		const { container } = render(Treemap, { nodes: TREE, edges: [], controls: true })

		expect(container.querySelector('[data-graph-depth-controls]')).not.toBeNull()
		expect(container.querySelector('[data-graph-density-controls]')).toBeNull()
		expect(container.querySelector('[data-graph-edge-style]')).toBeNull()
	})

	it('gives the call tree depth — the control that makes a big tree legible', () => {
		const { container } = render(CallTree, { nodes: CALLS, edges: CALL_EDGES, controls: true })

		expect(container.querySelector('[data-graph-depth-controls]')).not.toBeNull()
	})

	it('shows no controls at all unless asked', () => {
		// The default is the bare picture. A consumer embedding a diagram in their own shell
		// wants their own chrome, not two sets.
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS })

		expect(container.querySelector('[data-graph-diagram-overlay]')).toBeNull()
	})

	it('offers zoom wherever there is a canvas to zoom', () => {
		const { container } = render(CallTree, { nodes: CALLS, edges: CALL_EDGES, controls: true })

		expect(container.querySelector('[data-graph-zoom-controls]')).not.toBeNull()
	})
})

describe('the legend is opt-in, and shows what that diagram encodes', () => {
	it('shows nothing by default', () => {
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS })

		expect(container.querySelector('[data-graph-legend]')).toBeNull()
	})

	it('keys the ER diagram by group, since that is what the tint encodes', () => {
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS, legend: true })

		expect(container.querySelector('[data-legend-group="public"]')).not.toBeNull()
	})

	it('keys the dependency diagram by RELATION — reads and writes are the point', () => {
		const { container } = render(DependencyDiagram, {
			nodes: TABLES,
			edges: [{ source: 'orders', target: 'users', kind: 'dependency', relation: 'reads' }],
			legend: true
		})

		expect(container.querySelector('[data-legend-relation="reads"]')).not.toBeNull()
	})

	it('keys the call tree by kind', () => {
		const { container } = render(CallTree, {
			nodes: CALLS,
			edges: CALL_EDGES,
			legend: true
		})

		expect(container.querySelector('[data-legend-kind="function"]')).not.toBeNull()
	})
})

describe('the ER diagram tints by group, because flow has no cluster boxes', () => {
	it('turns the tint on by default', () => {
		// `flow` gives up group boxes to rank by direction, so without the tint a schema is
		// invisible — which is the one thing the old cluster layout did show.
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS })

		expect(container.querySelector('[data-graph-group-tint]')).not.toBeNull()
	})

	it('can be turned off', () => {
		const { container } = render(ErDiagram, {
			nodes: TABLES,
			edges: REFS,
			groupTint: false
		})

		expect(container.querySelector('[data-graph-group-tint]')).toBeNull()
	})
})

describe('a diagram still exposes the canvas contract', () => {
	it('reports the node a reader selected', () => {
		let picked: string | null | undefined
		const { container } = render(ErDiagram, {
			nodes: TABLES,
			edges: REFS,
			onselect: (id: string | null) => (picked = id)
		})

		;(container.querySelector('[data-graph-node="users"]') as HTMLElement).click()
		expect(picked).toBe('users')
	})

	it('maps fields, so a diagram takes the shape you already have', () => {
		const { container } = render(ErDiagram, {
			nodes: [{ key: 'people', team: 'hr', type: 'table' }],
			edges: [],
			fields: { id: 'key', label: 'key', group: 'team', kind: 'type' }
		})

		expect(container.querySelector('[data-graph-node="people"]')).not.toBeNull()
	})
})

describe('a control a diagram offers actually drives its canvas', () => {
	/* The wiring, not the markup. A control that reports a value the diagram never applies
	 * looks identical in the DOM to one that works — the knob moves and nothing happens, which
	 * is the exact failure this whole restructure exists to remove. */

	it('density changes how many rows the cards show', async () => {
		const { container } = render(ErDiagram, {
			nodes: TABLES,
			edges: REFS,
			density: 'names',
			controls: true
		})
		expect(container.querySelectorAll('[data-graph-row]')).toHaveLength(0)

		;(container.querySelector('[data-graph-density="full"]') as HTMLElement).click()
		await tick()
		expect(container.querySelectorAll('[data-graph-row]').length).toBeGreaterThan(0)
	})

	it('the edge-style toggle changes the drawn path', async () => {
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS, controls: true })
		const path = () => container.querySelector('[data-graph-edge] path')?.getAttribute('d')
		const curved = path()

		;(container.querySelector('[data-graph-edge-style]') as HTMLElement).click()
		await tick()
		expect(path()).not.toBe(curved)
		// An orthogonal route is horizontals and verticals; a curve is a bezier.
		expect(path()).not.toContain('C')
	})

	it('depth changes how much of the tree a treemap materialises', async () => {
		const { container } = render(Treemap, {
			nodes: TREE,
			edges: [],
			levels: 1,
			controls: true
		})
		const boxes = () => container.querySelectorAll('[data-graph-cluster]').length
		const shallow = boxes()

		;(container.querySelector('[data-graph-depth="3"]') as HTMLElement).click()
		await tick()
		expect(boxes()).toBeGreaterThan(shallow)
	})

	it('depth drives the call tree, which is what makes a big one legible', async () => {
		const { container } = render(CallTree, {
			nodes: CALLS,
			edges: CALL_EDGES,
			levels: 1,
			controls: true
		})
		const nodes = () => container.querySelectorAll('[data-graph-node]').length
		const shallow = nodes()

		;(container.querySelector('[data-graph-depth="2"]') as HTMLElement).click()
		await tick()
		expect(nodes()).toBeGreaterThan(shallow)
	})

	it('zoom drives the canvas transform', async () => {
		const { container } = render(ErDiagram, { nodes: TABLES, edges: REFS, controls: true })
		const scale = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform
		const fitted = scale()

		;(container.querySelector('[data-graph-zoom="in"]') as HTMLElement).click()
		await tick()
		expect(scale()).not.toBe(fitted)
	})

	it('the neighbourhood depth control walks another hop out', async () => {
		const { container } = render(Neighborhood, {
			nodes: CALLS,
			edges: CALL_EDGES,
			focus: 'a',
			depth: 1,
			controls: true
		})

		;(container.querySelector('[data-graph-depth="2"]') as HTMLElement).click()
		await tick()
		expect(container.querySelectorAll('[data-graph-node]').length).toBeGreaterThan(0)
	})
})

describe('a diagram with no data is an empty canvas, not a crash', () => {
	it.each([
		['ErDiagram', ErDiagram],
		['DependencyDiagram', DependencyDiagram],
		['CallTree', CallTree],
		['Treemap', Treemap],
		['Sunburst', Sunburst],
		['Neighborhood', Neighborhood]
	] as const)('%s renders with no props at all', (_name, Component) => {
		const { container } = render(Component)

		expect(container.querySelector('[data-graph-diagram-canvas]')).not.toBeNull()
		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
	})

	it('renders with no props at all', () => {
		const { container } = render(DependencyDiagram)

		expect(container.querySelector('[data-graph-diagram-canvas]')).not.toBeNull()
		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
	})
})

describe('a diagram can share a state, so views beside it see the same selection', () => {
	it('renders through a supplied state instead of building its own', async () => {
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const shared = new GraphState({ nodes: TABLES, edges: REFS, fields: {}, layout: 'flow' })
		const { container } = render(ErDiagram, { state: shared })

		expect(container.querySelector('[data-graph-node="users"]')).not.toBeNull()
	})

	it('writes the selection into the state the caller owns', async () => {
		// The point of sharing: an entity table beside the canvas reads `state.value`, so
		// clicking a node in one view drives the other with no wiring between them.
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const shared = new GraphState({ nodes: TABLES, edges: REFS, fields: {}, layout: 'flow' })
		const { container } = render(ErDiagram, { state: shared })

		;(container.querySelector('[data-graph-node="users"]') as HTMLElement).click()
		expect(shared.value).toBe('users')
	})

	it('applies its OWN layout to a supplied state — that is what the name means', async () => {
		// Choosing `<Treemap>` is choosing the layout. A shared state carrying someone else's
		// would draw a different diagram than the one written down, which is exactly the
		// mismatch this whole split exists to remove.
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const shared = new GraphState({ nodes: TREE, edges: [], fields: {}, layout: 'cluster' })
		render(Treemap, { state: shared })
		await tick()

		expect(shared.layoutName).toBe('world')
	})

	it('writes the options its OWN controls drive, so they are not inert', async () => {
		// The trap this replaced: with a shared state the diagram wrote nothing, so clicking
		// its density control moved the button and changed nothing on the canvas — the exact
		// dead knob the whole restructure exists to remove.
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const shared = new GraphState({ nodes: TABLES, edges: REFS, fields: {}, density: 'full' })
		render(ErDiagram, { state: shared, density: 'names' })
		await tick()

		expect(shared.density).toBe('names')
	})

	it('never touches the caller’s DATA, preset or selection', async () => {
		// Where the line is: the diagram owns how the picture is drawn, the caller owns what is
		// in it. A component that re-applied the data would fight its owner on every render.
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const shared = new GraphState({ nodes: TABLES, edges: REFS, fields: {} })
		shared.select('users')
		render(ErDiagram, { state: shared })
		await tick()

		expect(shared.model.nodes).toHaveLength(2)
		expect(shared.value).toBe('users')
	})
})

describe('every diagram drives a SHARED state, not just one it built', () => {
	/* Table-driven: with a shared state each diagram has to write the options its own controls
	 * expose, or those controls are inert — the button moves and the canvas does not. That
	 * failure is per component, because each declares a different set. */

	const shared = [
		['ErDiagram', ErDiagram, { nodes: TABLES, edges: REFS }, 'flow'],
		['DependencyDiagram', DependencyDiagram, { nodes: TABLES, edges: REFS }, 'flow'],
		['CallTree', CallTree, { nodes: CALLS, edges: CALL_EDGES }, 'radial'],
		['Treemap', Treemap, { nodes: TREE, edges: [] }, 'world'],
		['Sunburst', Sunburst, { nodes: TREE, edges: [] }, 'sunburst'],
		['Neighborhood', Neighborhood, { nodes: CALLS, edges: CALL_EDGES, focus: 'a' }, 'neighborhood']
	] as const

	it.each(shared)('%s applies its layout to a supplied state', async (_n, Component, props, layout) => {
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const state = new GraphState({ ...props, fields: {}, layout: 'cluster' })
		render(Component, { ...props, state, controls: true })
		await tick()

		expect(state.layoutName).toBe(layout)
	})

	it.each(shared)('%s still renders its controls over a supplied state', async (_n, Component, props) => {
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const state = new GraphState({ ...props, fields: {} })
		const { container } = render(Component, { ...props, state, controls: true, legend: true })
		await tick()

		expect(container.querySelector('[data-graph-zoom-controls]')).not.toBeNull()
		expect(container.querySelector('[data-graph-legend]')).not.toBeNull()
	})
})

describe('every diagram survives its own controls and legend', () => {
	/* Table-driven because the failure mode is per component: each declares its own control
	 * set and legend sections, and a diagram whose snippet references a control it did not
	 * import fails only when that branch renders. */

	const cases = [
		['ErDiagram', ErDiagram, { nodes: TABLES, edges: REFS }],
		['DependencyDiagram', DependencyDiagram, { nodes: TABLES, edges: REFS }],
		['CallTree', CallTree, { nodes: CALLS, edges: CALL_EDGES }],
		['Treemap', Treemap, { nodes: TREE, edges: [] }],
		['Sunburst', Sunburst, { nodes: TREE, edges: [] }],
		['Neighborhood', Neighborhood, { nodes: CALLS, edges: CALL_EDGES, focus: 'a' }]
	] as const

	it.each(cases)('%s draws a canvas with controls and a legend', (_name, Component, props) => {
		const { container } = render(Component, { ...props, controls: true, legend: true })

		expect(container.querySelector('[data-graph-diagram-canvas]')).not.toBeNull()
		expect(container.querySelector('[data-graph-diagram-overlay]')).not.toBeNull()
		expect(container.querySelector('[data-graph-legend]')).not.toBeNull()
	})

	it.each(cases)('%s offers zoom, which every canvas has', (_name, Component, props) => {
		const { container } = render(Component, { ...props, controls: true })

		expect(container.querySelector('[data-graph-zoom-controls]')).not.toBeNull()
	})

	it.each(cases)('%s draws the bare picture by default', (_name, Component, props) => {
		const { container } = render(Component, props)

		expect(container.querySelector('[data-graph-diagram-overlay]')).toBeNull()
		expect(container.querySelector('[data-graph-legend]')).toBeNull()
	})
})
