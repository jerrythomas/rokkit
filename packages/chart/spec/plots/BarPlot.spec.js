import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import BarPlot from '../../src/plots/BarPlot.svelte'

describe('BarPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(BarPlot)
		// expect(container).toMatchSnapshot()
	})
})
