import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ContinuousLegend from '../../src/elements/ContinuousLegend.svelte'

describe('ContinuousLegend.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(ContinuousLegend)
		// expect(container).toMatchSnapshot()
	})
})
