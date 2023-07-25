import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Chart from '../../src/chart/Chart.svelte'

describe('Chart.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Chart)
		// expect(container).toMatchSnapshot()
	})
})
