import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import FacetGrid from '../../src/chart/FacetGrid.svelte'

describe('FacetGrid.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(FacetGrid)
		// expect(container).toMatchSnapshot()
	})
})
