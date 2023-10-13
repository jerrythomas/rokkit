import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import AxisGrid from '../../src/chart/AxisGrid.svelte'

describe('AxisGrid.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(AxisGrid)
		// expect(container).toMatchSnapshot()
	})
})
