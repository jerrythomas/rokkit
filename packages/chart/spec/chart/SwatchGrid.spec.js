import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SwatchGrid from '../../src/chart/SwatchGrid.svelte'

describe('SwatchGrid.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(SwatchGrid)
		// expect(container).toMatchSnapshot()
	})
})
