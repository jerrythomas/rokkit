import { describe, expect, beforeEach, it, vi, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ColorRamp from '../../src/elements/ColorRamp.svelte'
import { scaleLinear } from 'd3-scale'

describe('ColorRamp.svelte', () => {
	beforeEach(() => {
		cleanup()
		Math.random = vi.fn(() => 0.123456789)
	})
	afterEach(() => vi.restoreAllMocks())

	it('should render', () => {
		const scale = scaleLinear().domain([0, 1]).range(['#f00', '#0f0'])
		const { container } = render(ColorRamp, { props: { scale } })
		expect(container).toMatchSnapshot()
	})
})
