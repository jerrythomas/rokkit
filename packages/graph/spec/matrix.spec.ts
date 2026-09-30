/* DependencyMatrix: DOM and attributes. The ordering maths is covered by layout/matrix.spec.ts
   with no renderer; this asserts what reaches the page, and that selection round-trips. */

import { describe, it, expect, vi } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import DependencyMatrix from '../src/diagrams/DependencyMatrix.svelte'
import { GraphState } from '../src/GraphState.svelte.js'
import * as graph from '../src/index.js'

const NODES = [
	{ id: 'ui', label: 'ui', group: 'web' },
	{ id: 'app', label: 'app', group: 'web' },
	{ id: 'core', label: 'core', group: 'lib' }
]
const EDGES = [
	{ source: 'ui', target: 'app' },
	{ source: 'app', target: 'core' },
	{ source: 'ui', target: 'core' },
	{ source: 'ui', target: 'core', relation: 'calls' },
	{ source: 'core', target: 'ui' } // against the grain
]

const q = (c: HTMLElement, sel: string) => [...c.querySelectorAll(sel)] as HTMLElement[]

describe('DependencyMatrix', () => {
	it('draws a row header per node, providers first', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES })
		expect(q(container, '[data-matrix-row]').map((r) => r.getAttribute('data-matrix-row'))).toEqual([
			'core',
			'app',
			'ui'
		])
		expect(q(container, '[data-matrix-col]').length).toBe(3)
	})

	it('draws a cell per dependency pair, flagging the ones above the diagonal', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES })
		const cells = q(container, '[data-matrix-cell]')
		expect(cells.length).toBe(4)
		const above = q(container, '[data-matrix-cell][data-matrix-above]')
		expect(above.map((c) => `${c.getAttribute('data-matrix-from')}>${c.getAttribute('data-matrix-to')}`)).toEqual([
			'core>ui'
		])
	})

	it('scales each cell by its edge count', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES })
		const doubled = container.querySelector('[data-matrix-from="ui"][data-matrix-to="core"]') as HTMLElement
		expect(doubled.style.getPropertyValue('--cell-weight')).toBe('1')
		expect(doubled.querySelector('title')?.textContent).toBe('ui → core (2)')
		const single = container.querySelector('[data-matrix-from="ui"][data-matrix-to="app"]') as HTMLElement
		expect(single.style.getPropertyValue('--cell-weight')).toBe('0.5')
	})

	it('outlines each group on the diagonal', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES })
		expect(q(container, '[data-matrix-block]').map((b) => b.getAttribute('data-matrix-block'))).toEqual([
			'lib',
			'web'
		])
	})

	it('draws no blocks when grouping is off', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES, groupBy: null })
		expect(q(container, '[data-matrix-block]')).toEqual([])
	})

	it('has an accessible name that counts the dependencies against the grain', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES })
		const label = container.querySelector('[data-graph-matrix]')?.getAttribute('aria-label') ?? ''
		expect(label).toContain('3 nodes')
		expect(label).toContain('1 above the diagonal')
	})

	it('selects a node from its row header and marks its row and column', async () => {
		const onselect = vi.fn()
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES, onselect })
		const row = container.querySelector('[data-matrix-row="app"]') as HTMLElement
		await fireEvent.click(row)
		expect(onselect).toHaveBeenCalledWith('app')
		expect(row.getAttribute('data-matrix-state')).toBe('selected')
		const lit = q(container, '[data-matrix-cell][data-matrix-state="highlight"]')
		expect(lit.map((c) => `${c.getAttribute('data-matrix-from')}>${c.getAttribute('data-matrix-to')}`).sort()).toEqual([
			'app>core',
			'ui>app'
		])
	})

	it('selects from the keyboard, and a second press clears', async () => {
		const onselect = vi.fn()
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES, onselect })
		const row = container.querySelector('[data-matrix-row="core"]') as HTMLElement
		await fireEvent.keyDown(row, { key: 'Enter' })
		expect(onselect).toHaveBeenLastCalledWith('core')
		await fireEvent.keyDown(row, { key: ' ' })
		expect(onselect).toHaveBeenLastCalledWith(null)
		await fireEvent.keyDown(row, { key: 'x' })
		expect(onselect).toHaveBeenCalledTimes(2)
	})

	it('shares a supplied state, so a node-link view beside it sees the same selection', async () => {
		const state = new GraphState({ nodes: NODES, edges: EDGES })
		const { container } = render(DependencyMatrix, { state })
		state.select('ui')
		await tick()
		expect(container.querySelector('[data-matrix-row="ui"]')?.getAttribute('data-matrix-state')).toBe('selected')
	})

	it('sizes the drawing from the cell size', () => {
		const { container } = render(DependencyMatrix, { nodes: NODES, edges: EDGES, cell: 20 })
		const cell = container.querySelector('[data-matrix-cell] rect') as SVGRectElement
		expect(cell.getAttribute('width')).toBe('20')
	})

	it('is exported with its builder', () => {
		expect(graph.DependencyMatrix).toBe(DependencyMatrix)
		expect(typeof graph.buildMatrix).toBe('function')
	})

	it('renders an empty matrix with no data', () => {
		const { container } = render(DependencyMatrix, {})
		expect(container.querySelector('[data-graph-matrix]')).toBeTruthy()
		expect(q(container, '[data-matrix-cell]')).toEqual([])
	})
})
