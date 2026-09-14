import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Panel from '../../src/FacetPlot/Panel.svelte'

/**
 * Panel is only ever rendered by FacetPlot, which always supplies data/geoms/
 * helpers — so its prop DEFAULTS never ran. They are what keep a panel renderable
 * while the facet split is still resolving, or for a facet key with no rows.
 */

describe('FacetPlot/Panel — prop defaults', () => {
	it('renders without throwing when data, geoms and helpers are all omitted', () => {
		expect(() => render(Panel, { props: { x: 'a', y: 'b' } })).not.toThrow()
	})

	it('renders an empty panel for a facet key with no rows', () => {
		const { container } = render(Panel, { props: { x: 'a', y: 'b', data: [] } })

		expect(container).toBeTruthy()
	})
})
