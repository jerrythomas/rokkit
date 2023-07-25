import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import RankBarPlot from '../../src/plots/RankBarPlot.svelte'

describe('RankBarPlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(RankBarPlot)
		// expect(container).toMatchSnapshot()
	})
})
