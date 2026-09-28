/* DOM and attributes ONLY. Everything about what the values should be is already covered by
   GraphState.spec.ts with no renderer; asserting it again here would just be slower. */

import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render } from '@testing-library/svelte'
import Graph from '../src/Graph.svelte'
import { GraphState } from '../src/GraphState.svelte.js'
import type { GraphStateConfig } from '../src/GraphState.svelte.js'
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
		columns: [{ name: 'id', type: 'uuid', pk: true }]
	},
	{ schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] },
	{ schema: 'audit', name: 'log', kind: 'matview', columns: [] }
]

const EDGES = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

/** A second, geometrically distinct edge — needed to catch loop-variable bugs. */
const SECOND_EDGE = {
	from: { s: 'audit', t: 'log', c: 'actor' },
	to: { s: 'public', t: 'users', c: 'id' }
}

/** A state is the component's ONLY input — that is what makes this spec DOM-only. */
const state = (config: Partial<GraphStateConfig> = {}) =>
	new GraphState({ nodes: NODES, edges: EDGES, fields: FIELDS, ...config })

describe('Graph — structure', () => {
	it('renders one node element per laid-out card', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(3)
	})

	it('renders one edge element per routed edge', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelectorAll('[data-graph-edge]')).toHaveLength(1)
	})

	it('renders one cluster element per cluster the state reports', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(2)
	})

	it('renders no clusters when the state reports none', () => {
		const { container } = render(Graph, {
			state: state({ layout: 'neighborhood', focus: 'public.users' })
		})

		expect(container.querySelectorAll('[data-graph-cluster]')).toHaveLength(0)
	})

	it('reuses the dotted canvas primitive instead of shipping its own', () => {
		// [data-graph-paper] already exists in @rokkit/themes; .dg-dots is deleted.
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-graph-paper]')).not.toBeNull()
	})

	it('renders an empty canvas for an empty model', () => {
		const { container } = render(Graph, {
			state: new GraphState({ nodes: [], edges: [], fields: FIELDS })
		})

		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(0)
		expect(container.querySelector('[data-graph-paper]')).not.toBeNull()
	})
})

describe('Graph — published attributes', () => {
	it('publishes each node kind as data-node-kind so CSS can colour it', () => {
		const { container } = render(Graph, { state: state() })
		const kinds = [...container.querySelectorAll('[data-graph-node]')].map((el) =>
			el.getAttribute('data-node-kind')
		)

		expect(kinds.sort()).toEqual(['matview', 'table', 'view'])
	})

	it('publishes the group name for attribute overrides', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-node-group="public"]')).not.toBeNull()
	})

	it('publishes the edge kind', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-graph-edge]')?.getAttribute('data-edge-kind')).toBe(
			'reference'
		)
	})

	it('publishes the relation verb so a theme can tell reads from writes', () => {
		const s = new GraphState({
			nodes: NODES,
			edges: [{ ...EDGES[0], rel: 'dependency', verb: 'reads' }],
			fields: { ...FIELDS, edgeKind: 'rel', relation: 'verb' }
		})
		const { container } = render(Graph, { state: s })
		const edge = container.querySelector('[data-graph-edge]')

		expect(edge?.getAttribute('data-edge-kind')).toBe('dependency')
		expect(edge?.getAttribute('data-edge-relation')).toBe('reads')
	})

	it('omits data-edge-relation entirely when the edge has no verb', () => {
		// Absent, not empty: `[data-edge-relation]` must not match a plain foreign key.
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-graph-edge]')?.hasAttribute('data-edge-relation')).toBe(
			false
		)
	})

	it('marks a pk row with data-row-badge', () => {
		const { container } = render(Graph, { state: state({ density: 'full' }) })

		expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
	})

	it('marks a derived fk row with data-row-badge', () => {
		const { container } = render(Graph, { state: state({ density: 'full' }) })

		expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
	})

	it('renders a row element per visible row and none at density names', () => {
		const { container: full } = render(Graph, { state: state({ density: 'full' }) })
		const { container: names } = render(Graph, { state: state({ density: 'names' }) })

		expect(full.querySelectorAll('[data-graph-row]').length).toBeGreaterThan(0)
		expect(names.querySelectorAll('[data-graph-row]')).toHaveLength(0)
	})

	it('shows the hidden-row count when the density hides rows', () => {
		const { container } = render(Graph, { state: state({ density: 'names' }) })

		expect(container.querySelector('[data-graph-more]')?.textContent).toContain('1')
	})

	it('renders a spacer for a badge-less row so the name column stays aligned', () => {
		// Without it, a plain column's name would start where a keyed column's icon does and
		// the card's left edge would look ragged.
		const plain = [
			{ schema: 'p', name: 't', kind: 'table', columns: [{ name: 'plain', type: 'text' }] }
		]
		const { container } = render(Graph, {
			state: new GraphState({ nodes: plain, edges: [], fields: FIELDS, density: 'full' })
		})

		expect(container.querySelector('[data-row-badge-empty]')).not.toBeNull()
		expect(container.querySelector('[data-row-badge]')).toBeNull()
	})

	it('marks a head-only card so CSS can drop its body border', () => {
		// audit.log has no columns at all, so it has neither rows nor a more-row.
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-node-headonly]')).not.toBeNull()
	})
})

describe('Graph — state reflected into the DOM', () => {
	it('reflects nodeState onto data-node-state', () => {
		const s = state()
		s.select('public.users')
		const { container } = render(Graph, { state: s })

		expect(container.querySelector('[data-node-state="selected"]')).not.toBeNull()
		expect(container.querySelector('[data-node-state="related"]')).not.toBeNull()
		expect(container.querySelector('[data-node-state="dim"]')).not.toBeNull()
	})

	it('reflects edgeState onto data-edge-state', () => {
		const s = state()
		s.select('public.users')
		const { container } = render(Graph, { state: s })

		expect(container.querySelector('[data-edge-state="highlight"]')).not.toBeNull()
	})

	it('spreads the state group style onto the cluster as custom properties', () => {
		const { container } = render(Graph, { state: state() })
		const cluster = container.querySelector('[data-graph-cluster]') as HTMLElement

		expect(cluster.style.getPropertyValue('--group-fill')).not.toBe('')
	})

	it('uses the state edge path for EACH edge, keyed by the loop variable', () => {
		// TWO edges on purpose. With one, `graph.edgePath(graph.routedEdges[0])` hardcoded in
		// place of the loop variable passes — there is nothing else in the array to disagree.
		const s = state({ edges: [...EDGES, SECOND_EDGE] })
		const { container } = render(Graph, { state: s })
		const rendered = [...container.querySelectorAll('[data-graph-edge] path')].map((p) =>
			p.getAttribute('d')
		)

		expect(rendered).toHaveLength(2)
		expect(new Set(rendered).size).toBe(2)
		expect(rendered).toEqual(s.routedEdges.map((e) => s.edgePath(e)))
	})

	it('positions EACH card from its own geometry, not the first card’s', () => {
		// Same loop-variable trap as the edge paths above: three cards at distinct
		// coordinates, so a hardcoded index cannot pass.
		const s = state()
		const { container } = render(Graph, { state: s })
		const placed = [...container.querySelectorAll('[data-graph-node]')].map(
			(el) => (el as HTMLElement).style.left
		)

		expect(new Set(placed).size).toBeGreaterThan(1)
	})
})

describe('Graph — intent routing', () => {
	it('routes a node click through state.select', () => {
		const s = state()
		const { container } = render(Graph, { state: s })

		;(container.querySelector('[data-graph-node]') as HTMLElement).click()
		expect(s.value).not.toBeNull()
	})

	it('selects the node that was clicked, not the first one', () => {
		const s = state()
		const { container } = render(Graph, { state: s })
		const nodes = [...container.querySelectorAll('[data-graph-node]')] as HTMLElement[]

		nodes[nodes.length - 1].click()
		expect(s.value).toBe(nodes[nodes.length - 1].getAttribute('data-graph-node'))
	})

	it('routes a canvas click through state.clear', () => {
		const s = state()
		s.select('public.users')
		const { container } = render(Graph, { state: s })

		;(container.querySelector('[data-graph-paper]') as HTMLElement).click()
		expect(s.value).toBeNull()
	})

	it('does not clear the selection when a node inside the canvas is clicked', () => {
		// The node click must stopPropagation, or selecting anything immediately unselects it
		// as the event bubbles to the canvas.
		const s = state()
		const { container } = render(Graph, { state: s })

		;(container.querySelector('[data-graph-node]') as HTMLElement).click()
		expect(s.value).not.toBeNull()
	})
})

describe('Graph — accessibility and construction', () => {
	it('scales the world by the zoom prop', () => {
		// jsdom reports 0 for clientWidth/Height, so the fit lands on its 0.08 floor. That is
		// what makes the MULTIPLIER observable: the ratio is what this asserts, not the fit.
		const read = (container: HTMLElement) =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const { container: fitted } = render(Graph, { state: state() })
		const { container: zoomed } = render(Graph, { state: state(), zoom: 2 })

		expect(read(fitted)).toContain('scale(0.08)')
		expect(read(zoomed)).toContain('scale(0.16)')
	})

	it('defaults zoom to 1 so the diagram fits', () => {
		const { container: implied } = render(Graph, { state: state() })
		const { container: explicit } = render(Graph, { state: state(), zoom: 1 })
		const read = (c: HTMLElement) =>
			(c.querySelector('[data-graph-world]') as HTMLElement).style.transform

		expect(read(implied)).toBe(read(explicit))
	})

	it('makes the more-row a real control that expands its card', async () => {
		const s = state({ density: 'names' })
		const { container } = render(Graph, { state: s })

		expect(container.querySelectorAll('[data-graph-row]')).toHaveLength(0)
		;(container.querySelector('[data-graph-more]') as HTMLElement).click()
		await tick()

		expect(container.querySelectorAll('[data-graph-row]').length).toBeGreaterThan(0)
		expect(container.querySelector('[data-graph-more][data-expanded]')?.textContent).toContain(
			'show less'
		)
	})

	it('renders the density toggle on the canvas', () => {
		const { container } = render(Graph, { state: state() })

		expect(container.querySelectorAll('[data-graph-density]')).toHaveLength(3)
		expect(container.querySelector('[data-graph-density="keys"][data-selected]')).not.toBeNull()
	})

	it('draws a directional arrowhead at the target, not a second anchor dot', () => {
		// An edge is directed; two identical dots discarded that.
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-graph-edge-arrow]')).not.toBeNull()
		expect(container.querySelector('[data-graph-edge-dot="to"]')).toBeNull()
		expect(container.querySelector('[data-graph-edge-dot="from"]')).not.toBeNull()
	})

	it('points the arrowhead against the side the curve arrives from', () => {
		// Heading is -s2, so a target approached on its left (-1) points right and vice
		// versa. A fixed direction would have every arrow right on half the diagram.
		const s = state()
		const { container } = render(Graph, { state: s })
		const edge = s.routedEdges[0]
		const points = container.querySelector('[data-graph-edge-arrow]')?.getAttribute('points')
		const tailX = edge.x2 - -edge.s2 * 9

		expect(points).toContain(`${edge.x2},${edge.y2}`)
		expect(points).toContain(`${tailX},`)
	})

	it('falls back to an anchor dot when arrows are off', () => {
		const { container } = render(Graph, { state: state(), arrows: false })

		expect(container.querySelector('[data-graph-edge-arrow]')).toBeNull()
		expect(container.querySelector('[data-graph-edge-dot="to"]')).not.toBeNull()
	})

	it('the density toggle drives a CALLER-SUPPLIED state, not just its own prop', () => {
		// `density` as a prop only ever reaches the state Graph owns. With a shared state —
		// which is how all three views compose — a control that set the prop would render,
		// click, and change nothing at all.
		const s = state({ density: 'names' })
		const { container } = render(Graph, { state: s })

		;(container.querySelector('[data-graph-density="full"]') as HTMLElement).click()

		expect(s.density).toBe('full')
	})

	it('prints the state’s more-row label verbatim, including the no-keys case', () => {
		const keyless = [
			{ schema: 'public', name: 'active_orders', kind: 'view', columns: [{ name: 'id' }] }
		]
		const s = new GraphState({ nodes: keyless, edges: [], fields: FIELDS, density: 'keys' })
		const { container } = render(Graph, { state: s })

		expect(container.querySelector('[data-graph-more]')?.textContent).toBe('no keys · 1 row')
	})

	it('zooms on ctrl+wheel and prevents the browser zooming the page instead', async () => {
		const { container } = render(Graph, { state: state() })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		const read = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const before = read()
		const event = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, cancelable: true })
		paper.dispatchEvent(event)
		await tick()

		expect(event.defaultPrevented).toBe(true)
		expect(read()).not.toBe(before)
	})

	it('leaves a PLAIN wheel alone so the canvas still scrolls', async () => {
		const { container } = render(Graph, { state: state() })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		const read = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const before = read()
		const event = new WheelEvent('wheel', { deltaY: -120, cancelable: true })
		paper.dispatchEvent(event)
		await tick()

		expect(event.defaultPrevented).toBe(false)
		expect(read()).toBe(before)
	})

	it('zooms out on a downward ctrl+wheel', async () => {
		const { container } = render(Graph, { state: state(), zoom: 2 })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		const read = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const before = read()
		paper.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, cancelable: true }))
		await tick()

		expect(read()).not.toBe(before)
	})

	it('ignores the wheel entirely when zoomable is off', async () => {
		const { container } = render(Graph, { state: state(), zoomable: false })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		const event = new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, cancelable: true })

		paper.dispatchEvent(event)
		await tick()

		expect(event.defaultPrevented).toBe(false)
	})

	it('pans the canvas by dragging the background', async () => {
		const { container } = render(Graph, { state: state() })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		paper.setPointerCapture = () => {}
		Object.defineProperty(paper, 'scrollLeft', { value: 0, writable: true })
		Object.defineProperty(paper, 'scrollTop', { value: 0, writable: true })

		paper.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 80, bubbles: true }))
		await tick()
		paper.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 50, bubbles: true }))

		expect(paper.scrollLeft).toBe(40)
		expect(paper.scrollTop).toBe(30)
	})

	it('does not pan when the drag starts on a card — that is a selection', async () => {
		const { container } = render(Graph, { state: state() })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		const node = container.querySelector('[data-graph-node]') as HTMLElement
		paper.setPointerCapture = () => {}
		Object.defineProperty(paper, 'scrollLeft', { value: 0, writable: true })

		node.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 80, bubbles: true }))
		await tick()
		paper.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 50, bubbles: true }))

		expect(paper.scrollLeft).toBe(0)
	})

	it('stops panning on pointerup', async () => {
		const { container } = render(Graph, { state: state() })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement
		paper.setPointerCapture = () => {}
		Object.defineProperty(paper, 'scrollLeft', { value: 0, writable: true })
		Object.defineProperty(paper, 'scrollTop', { value: 0, writable: true })

		paper.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 80, bubbles: true }))
		await tick()
		paper.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
		await tick()
		paper.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 10, bubbles: true }))

		expect(paper.scrollLeft).toBe(0)
	})

	it('expands a card from the keyboard, not only by pointer', async () => {
		const s = state({ density: 'names' })
		const { container } = render(Graph, { state: s })
		const more = container.querySelector('[data-graph-more]') as HTMLElement

		more.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
		await tick()

		expect(container.querySelectorAll('[data-graph-row]').length).toBeGreaterThan(0)
	})

	it('ignores an unrelated key on the more-row', async () => {
		const s = state({ density: 'names' })
		const { container } = render(Graph, { state: s })
		const more = container.querySelector('[data-graph-more]') as HTMLElement

		more.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))
		await tick()

		expect(container.querySelectorAll('[data-graph-row]')).toHaveLength(0)
	})

	it('zooms out from the control', async () => {
		const { container } = render(Graph, { state: state(), zoom: 2 })
		const read = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const before = read()
		;(container.querySelector('[data-graph-zoom="out"]') as HTMLElement).click()
		await tick()

		expect(read()).not.toBe(before)
	})

	it('renders zoom controls on the canvas', () => {
		// On the canvas, not in a host app's settings drawer — a zoom control a reader has to
		// go looking for is one they never find.
		const { container } = render(Graph, { state: state() })

		expect(container.querySelector('[data-graph-zoom="in"]')).not.toBeNull()
		expect(container.querySelector('[data-graph-zoom="out"]')).not.toBeNull()
		expect(container.querySelector('[data-graph-zoom="reset"]')?.textContent).toContain('100%')
	})

	it('zooms in and out from the controls', async () => {
		const { container } = render(Graph, { state: state() })
		const read = () =>
			(container.querySelector('[data-graph-world]') as HTMLElement).style.transform

		const fitted = read()
		;(container.querySelector('[data-graph-zoom="in"]') as HTMLElement).click()
		await tick()

		expect(read()).not.toBe(fitted)

		;(container.querySelector('[data-graph-zoom="reset"]') as HTMLElement).click()
		await tick()

		expect(read()).toBe(fitted)
	})

	it('omits the controls when zoomable is off', () => {
		const { container } = render(Graph, { state: state(), zoomable: false })

		expect(container.querySelector('[data-graph-zoom-controls]')).toBeNull()
	})

	it('takes its accessible name from the state', () => {
		// Cycle 1 of the radar work shipped sparklines with no role/accessible name
		// and had to pay it back later. Not repeating that here.
		const { container } = render(Graph, { state: state({ label: 'Schema diagram' }) })

		expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
			'Schema diagram'
		)
	})

	it('keeps the node buttons OUTSIDE the role="img" subtree', () => {
		// role="img" makes its whole subtree presentational. Putting it on the root — the
		// obvious place, and where the first draft had it — hides every node button from
		// assistive tech while still passing the aria-label assertion above.
		const { container } = render(Graph, { state: state() })
		const graphic = container.querySelector('[role="img"]') as HTMLElement

		expect(graphic.querySelectorAll('[data-graph-node]')).toHaveLength(0)
		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(3)
	})

	it('gives every node a real button so it is keyboard reachable', () => {
		const { container } = render(Graph, { state: state() })

		for (const node of container.querySelectorAll('[data-graph-node]')) {
			expect(node.tagName).toBe('BUTTON')
		}
	})

	it('clears the selection on Escape, not only on a background click', () => {
		const s = state()
		s.select('public.users')
		const { container } = render(Graph, { state: s })
		const paper = container.querySelector('[data-graph-paper]') as HTMLElement

		paper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		expect(s.value).toBeNull()
	})

	it('constructs its own state when given nodes/edges/fields instead', () => {
		// The common case stays a one-liner; passing a state is for composition and tests.
		const { container } = render(Graph, { nodes: NODES, edges: EDGES, fields: FIELDS })

		expect(container.querySelectorAll('[data-graph-node]')).toHaveLength(3)
	})

	it('applies config props when it constructs its own state', () => {
		// Proves the props actually reach the constructed state rather than only the
		// nodes/edges/fields triple.
		const { container } = render(Graph, {
			nodes: NODES,
			edges: EDGES,
			fields: FIELDS,
			density: 'names'
		})

		expect(container.querySelectorAll('[data-graph-row]')).toHaveLength(0)
	})
})
