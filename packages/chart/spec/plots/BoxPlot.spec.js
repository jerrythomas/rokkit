import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import BoxPlot from '../../src/plots/BoxPlot.svelte'

describe('BoxPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(BoxPlot)
		// expect(container).toMatchSnapshot()
	})
})
