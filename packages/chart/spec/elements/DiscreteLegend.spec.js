import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import DiscreteLegend from '../../src/elements/DiscreteLegend.svelte'

describe('DiscreteLegend.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(DiscreteLegend)
		// expect(container).toMatchSnapshot()
	})
})
