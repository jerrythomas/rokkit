import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ColorRamp from '../../src/elements/ColorRamp.svelte'
import { scaleBand } from 'd3-scale'

describe('ColorRamp.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const scale = scaleBand().domain([0, 1]).range(['#f00', '#0f0'])
		// const { container } = render(ColorRamp, { props: scale })
		// expect(container).toMatchSnapshot()
	})
})
