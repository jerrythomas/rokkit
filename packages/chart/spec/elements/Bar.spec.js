import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Bar from '../../src/elements/Bar.svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import { writable } from 'svelte/store'

describe('Bar.svelte', () => {
	const scales = writable({
		x: scaleBand().domain(['a', 'b', 'c']).range([0, 100]),
		y: scaleLinear().domain([0, 100]).range([0, 100])
	})
	beforeEach(() => cleanup())

	it('should render a bar', () => {
		const { container } = render(Bar, {
			props: { rank: 1, name: 'Alpha', value: 10, scales, fill: 'red' }
		})
		expect(container).toMatchSnapshot()
	})
})
