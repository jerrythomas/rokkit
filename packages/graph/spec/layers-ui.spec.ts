/* #167 in the rendered diagram: labelled layers, edges marked by conformance, a violations filter. */
import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import LayersDiagram from '../src/diagrams/LayersDiagram.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

const NODES = [
	{ id: 'api', label: 'api', layer: 0 },
	{ id: 'tasks', label: 'tasks', layer: 1 },
	{ id: 'db', label: 'db', layer: 2 }
]
const EDGES = [
	{ source: 'api', target: 'tasks' },
	{ source: 'tasks', target: 'db' },
	{ source: 'db', target: 'tasks' },
	{ source: 'api', target: 'db' }
]
const edges = (c: HTMLElement) => [...c.querySelectorAll('[data-graph-edge]')]

describe('LayersDiagram', () => {
	it('draws with the layers layout, one labelled band per layer', () => {
		const { container } = render(LayersDiagram, { nodes: NODES, edges: EDGES, layerLabels: ['Interface'] })
		expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe('layers')
		const labels = [...container.querySelectorAll('[data-graph-cluster-label]')].map((l) => l.textContent?.split(' ·')[0])
		expect(labels).toEqual(['Interface', 'Layer 1', 'Layer 2'])
	})

	it('marks every edge with its conformance, the climbing one as up', () => {
		const { container } = render(LayersDiagram, { nodes: NODES, edges: EDGES })
		const byPair = Object.fromEntries(
			edges(container).map((e) => [`${e.getAttribute('data-edge-from')}>${e.getAttribute('data-edge-to')}`, e.getAttribute('data-edge-conformance')])
		)
		expect(byPair).toEqual({ 'api>tasks': 'down', 'tasks>db': 'down', 'db>tasks': 'up', 'api>db': 'skip' })
	})

	it('shows only the violations from its control, and back', async () => {
		const { container } = render(LayersDiagram, { nodes: NODES, edges: EDGES, controls: true })
		const toggle = container.querySelector<HTMLElement>('[data-graph-violations]')!
		expect(toggle.getAttribute('aria-pressed')).toBe('false')
		await fireEvent.click(toggle)
		await tick()
		expect(edges(container).map((e) => e.getAttribute('data-edge-conformance'))).toEqual(['up'])
		expect(toggle.getAttribute('aria-pressed')).toBe('true')
		await fireEvent.click(toggle)
		await tick()
		expect(edges(container)).toHaveLength(4)
	})

	it('takes showEdges as a prop too', () => {
		const { container } = render(LayersDiagram, { nodes: NODES, edges: EDGES, showEdges: 'violations' })
		expect(edges(container)).toHaveLength(1)
	})
})

describe('GraphState — showEdges', () => {
	it('survives the next merge when the control set it', () => {
		const s = new GraphState({ nodes: NODES, edges: EDGES, layout: 'layers' })
		s.setShowEdges('violations')
		s.apply({ density: 'names' })
		expect(s.showEdges).toBe('violations')
		expect(s.routedEdges).toHaveLength(1)
	})
})

describe('LayersDiagram — composition', () => {
	it('with the caller’s state, merges only its own options and keeps the caller’s data', async () => {
		const state = new GraphState({ nodes: NODES, edges: EDGES, layout: 'flow' })
		const { container } = render(LayersDiagram, { state, controls: true, legend: true })
		await tick()
		expect(state.layoutName).toBe('layers')
		expect(state.model.nodes).toHaveLength(3)
		expect(container.querySelector('[data-graph-legend]')).not.toBeNull()
	})

	it('drives density and zoom from its own controls', async () => {
		const { container } = render(LayersDiagram, { nodes: NODES, edges: EDGES, controls: true })
		await fireEvent.click(container.querySelector('[data-graph-density="full"]')!)
		await tick()
		expect(container.querySelector('[data-graph-paper]')?.getAttribute('data-graph-detail')).not.toBeNull()
		const zoomIn = [...container.querySelectorAll<HTMLElement>('[data-graph-zoom-controls] button')].at(-1)!
		await fireEvent.click(zoomIn)
		await tick()
		expect(container.querySelector('[data-graph-density="full"]')?.getAttribute('aria-pressed')).toBe('true')
	})
})
