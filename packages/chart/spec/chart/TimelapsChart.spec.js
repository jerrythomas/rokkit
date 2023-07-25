import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import TimelapseChart from '../../src/chart/TimelapseChart.svelte'

describe('TimelapseChart.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(TimelapseChart)
		// expect(container).toMatchSnapshot()
	})
})
