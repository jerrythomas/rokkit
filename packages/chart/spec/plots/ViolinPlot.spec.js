import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ViolinPlot from '../../src/plots/ViolinPlot.svelte'

describe('ViolinPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(ViolinPlot)
		// expect(container).toMatchSnapshot()
	})
})
