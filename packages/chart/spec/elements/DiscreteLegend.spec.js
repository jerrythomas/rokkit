import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import DiscreteLegend from '../../src/elements/DiscreteLegend.svelte'

describe('DiscreteLegend.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const scale = scaleLinear().domain([0, 1])
		const { container } = render(DiscreteLegend, { props: { scale } })
		expect(container).toMatchSnapshot()
	})
})
