import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import HeatMapCalendar from '../../src/plots/HeatMapCalendar.svelte'

describe('HeatMapCalendar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(HeatMapCalendar)
		// expect(container).toMatchSnapshot()
	})
})
