import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ContinuousLegend from '../../src/elements/ContinuousLegend.svelte'
import { scaleLinear } from 'd3-scale'

describe('ContinuousLegend.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const scale = scaleLinear().domain([0, 1]).range(['#f00', '#0f0'])
		const { container } = render(ContinuousLegend, { props: { scale } })
		expect(container).toMatchSnapshot()
	})
})
