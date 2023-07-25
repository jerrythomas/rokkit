import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import FunnelPlot from '../../src/plots/FunnelPlot.svelte'

describe('FunnelPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(FunnelPlot)
		// expect(container).toMatchSnapshot()
	})
})
