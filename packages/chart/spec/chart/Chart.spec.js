import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Chart from '../../src/chart/Chart.svelte'

describe('Chart.svelte', () => {
	const data = [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 },
		{ x: 2, y: 2 },
		{ x: 3, y: 3 }
	]
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Chart, { data })
		expect(container).toMatchSnapshot()
	})
})
