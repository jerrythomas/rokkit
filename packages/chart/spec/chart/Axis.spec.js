import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Axis from '../../src/chart/Axis.svelte'
import ChartWrapper from './mocks/ChartWrapper.svelte'

describe('Axis.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(ChartWrapper, { component: Axis })
		// expect(container).toMatchSnapshot()
	})
})
