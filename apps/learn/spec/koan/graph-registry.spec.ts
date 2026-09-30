/* The registry's claims, checked against the components themselves.
 *
 * The demo shares ONE GraphState across a diagram and the entity views beside it, and
 * `GraphState.update()` fully re-applies — so the explorer has to pass the layout, which means
 * the registry restates something the component already knows. This is what stops the two
 * drifting: each component is rendered on its own and asked what it actually drew.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import { diagrams } from '../../src/lib/koan/demos/graph/registry'

/** Diagrams drawn on the node-link canvas — the matrix is not one, and has no layout. */
const onCanvas = diagrams.filter((d) => d.canvas !== 'matrix')

describe('graph demo registry', () => {
	it.each(onCanvas.map((d) => [d.id, d] as const))(
		'%s draws with the layout the registry claims',
		(_id, config) => {
			const data = datasets[config.dataset]
			const { container } = render(config.component, {
				nodes: data.nodes,
				edges: data.edges,
				fields: data.fields,
				...config.props
			})

			expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe(
				config.layout
			)
		}
	)

	it.each(diagrams.map((d) => [d.id, d] as const))(
		'%s renders something from the dataset it is paired with',
		(_id, config) => {
			// The mismatch this whole split removes: an ER dataset pointed at a radial tree
			// renders a hierarchy table entities do not have, and the reader is left deciding
			// whether the picture or the data is wrong.
			const data = datasets[config.dataset]
			const { container } = render(config.component, {
				nodes: data.nodes,
				edges: data.edges,
				fields: data.fields,
				...config.props
			})
			const drawn =
				container.querySelectorAll('[data-graph-node]').length +
				container.querySelectorAll('[data-graph-cluster]').length +
				container.querySelectorAll('[data-graph-wedge]').length +
				container.querySelectorAll('[data-matrix-cell]').length

			expect(drawn).toBeGreaterThan(0)
		}
	)

	it('offers the entity views only where nodes have rows to show', () => {
		// A codebase module has no columns, so an entity table over it is an empty grid.
		for (const config of diagrams) {
			const data = datasets[config.dataset]
			const hasRows = (data.nodes as Record<string, unknown>[]).some(
				(n) => Array.isArray(n.columns) && n.columns.length > 0
			)
			expect(Boolean(config.views), `${config.id}`).toBe(hasRows)
		}
	})

	it('offers a dependency matrix over the codebase components', () => {
		const matrix = diagrams.find((d) => d.canvas === 'matrix')
		expect(matrix?.dataset).toBe('components')
	})

	it('overlays co-change edges on hidden coupling without letting them shape the layout', () => {
		const coupling = diagrams.find((d) => d.id === 'coupling')!
		const data = datasets[coupling.dataset]
		const overlays = (data.edges as Record<string, unknown>[]).filter((e) => e.overlay)
		expect(overlays.length).toBeGreaterThan(0)
		const { container } = render(coupling.component, {
			nodes: data.nodes,
			edges: data.edges,
			fields: data.fields,
			...coupling.props
		})
		expect(container.querySelectorAll('[data-graph-edge][data-edge-overlay]').length).toBe(overlays.length)
	})

	it('pairs every diagram with a dataset that exists', () => {
		for (const config of diagrams) {
			expect(datasets[config.dataset], config.id).toBeDefined()
		}
	})
})
