/* #169 rendered: two sets of arcs over one axis, the hidden pairs styleable, the "only hidden"
 * toggle, and a key that says which side is which.
 */
import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import ArcDiagram from '../src/diagrams/ArcDiagram.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

const ITEMS = [
	{ id: 'file:resolve', name: 'resolve.rs', group: 'indexer' },
	{ id: 'file:walk', name: 'walk.rs', group: 'indexer' },
	{ id: 'file:fqn', name: 'fqn.rs', group: 'indexer' },
	{ id: 'file:persist', name: 'persist.rs', group: 'db' }
]
const RELATIONS = [
	{ set: 'imports', source: 'file:resolve', target: 'file:fqn', weight: 3 },
	{ set: 'imports', source: 'file:walk', target: 'file:fqn', weight: 1 },
	{ set: 'cochange', source: 'file:resolve', target: 'file:walk', weight: 18 },
	{ set: 'cochange', source: 'file:resolve', target: 'file:persist', weight: 11, hidden: true },
	{ set: 'cochange', source: 'file:resolve', target: 'file:fqn', weight: 9 }
]
const FIELDS = { id: 'id', label: 'name', group: 'group', relation: 'set' }
const props = { nodes: ITEMS, edges: RELATIONS, fields: FIELDS, above: 'cochange' }
const edgesOf = (c: HTMLElement) => [...c.querySelectorAll<SVGGElement>('[data-graph-edge]')]

describe('GraphState — arcs', () => {
	it('passes `above` to the layout, and scales each side’s strokes to its own heaviest', () => {
		const s = new GraphState({ ...props, layout: 'arcs' })
		const strongestImport = s.routedEdges.find((e) => e.relation === 'imports' && e.weight === 3)!
		const strongestCommit = s.routedEdges.find((e) => e.relation === 'cochange' && e.weight === 18)!
		expect(strongestImport.side).toBe('below')
		expect(strongestCommit.side).toBe('above')
		// Against one global maximum (18) the strongest import would draw at a sixth.
		expect(s.edgeWeight(strongestImport)).toBe(1)
		expect(s.edgeWeight(strongestCommit)).toBe(1)
	})

	it('still scales a weight globally where no layout set a strength', () => {
		const s = new GraphState({ ...props, layout: 'flow' })
		expect(s.edgeWeight(s.routedEdges.find((e) => e.weight === 3)!)).toBeCloseTo(3 / 18)
	})
})

describe('ArcDiagram', () => {
	it('draws with the arcs layout, a box per item, an arc per relation', () => {
		const { container } = render(ArcDiagram, props)
		expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe('arcs')
		expect(container.querySelectorAll('[data-graph-cluster][data-graph-node-id]')).toHaveLength(4)
		expect(edgesOf(container)).toHaveLength(5)
	})

	it('marks each arc’s side, and the hidden pair on its own', () => {
		const { container } = render(ArcDiagram, props)
		const sides = edgesOf(container).map((e) => e.getAttribute('data-edge-side'))
		expect(sides.filter((s) => s === 'below')).toHaveLength(2)
		expect(sides.filter((s) => s === 'above')).toHaveLength(3)
		const hidden = container.querySelectorAll('[data-graph-edge][data-edge-hidden]')
		expect(hidden).toHaveLength(1)
		expect(hidden[0].getAttribute('data-edge-to')).toBe('file:persist')
	})

	it('toggles to only the hidden pairs, and back — the axis stays put', async () => {
		const { container } = render(ArcDiagram, { ...props, controls: true })
		const toggle = container.querySelector<HTMLButtonElement>('[data-graph-hidden-only]')!
		const before = container.querySelector<HTMLElement>('[data-graph-node-id="file:persist"]')!.style.top
		expect(toggle.getAttribute('aria-pressed')).toBe('false')
		await fireEvent.click(toggle)
		await tick()
		expect(edgesOf(container)).toHaveLength(1)
		expect(toggle.getAttribute('aria-pressed')).toBe('true')
		expect(container.querySelector<HTMLElement>('[data-graph-node-id="file:persist"]')!.style.top).toBe(before)
		await fireEvent.click(toggle)
		await tick()
		expect(edgesOf(container)).toHaveLength(5)
	})

	it('names the two sides from the data, and the hidden pairs, in its legend — on by default', () => {
		const { container } = render(ArcDiagram, props)
		const sides = [...container.querySelectorAll('[data-legend-side]')].map((e) => [e.getAttribute('data-legend-side'), e.textContent?.trim()])
		expect(sides).toEqual([
			['below', expect.stringContaining('imports')],
			['above', expect.stringContaining('cochange')]
		])
		expect(container.querySelector('[data-legend-hidden]')?.textContent).toContain('Hidden coupling')
	})

	it('takes its own side names', () => {
		const { container } = render(ArcDiagram, { ...props, sideLabels: ['Calls', 'Co-edits'] })
		expect([...container.querySelectorAll('[data-legend-side]')].map((e) => e.textContent?.trim())).toEqual([
			expect.stringContaining('Calls'),
			expect.stringContaining('Co-edits')
		])
	})

	it('with the caller’s state, merges only its own options and keeps the caller’s data', async () => {
		const state = new GraphState({ ...props, above: undefined, layout: 'flow' })
		render(ArcDiagram, { state, above: 'cochange', showEdges: 'hidden' })
		await tick()
		expect(state.layoutName).toBe('arcs')
		expect(state.showEdges).toBe('hidden')
		expect(state.routedEdges).toHaveLength(1)
		expect(state.model.nodes).toHaveLength(4)
	})
})
