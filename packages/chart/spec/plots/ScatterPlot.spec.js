import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ScatterPlot from '../../src/plots/ScatterPlot.svelte'

describe('ScatterPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(ScatterPlot)
		// expect(container).toMatchSnapshot()
	})
})
