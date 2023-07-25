import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Plot from '../../src/plots/Plot.svelte'

describe('Plot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Plot)
		// expect(container).toMatchSnapshot()
	})
})
