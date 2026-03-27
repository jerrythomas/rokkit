import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Chart from '../src/Chart.svelte'

describe('Chart', () => {
	it('renders without errors with no props', () => {
		const { container } = render(Chart, { data: [], x: 'x', y: 'y' })
		expect(container).toBeTruthy()
	})

	it('renders with a ChartSpec', async () => {
		const { chart } = await import('../src/spec/chart-spec.js')
		const spec = chart([{ x: 1, y: 10 }])
			.x('x')
			.y('y')
			.bar()
		const { container } = render(Chart, { spec })
		expect(container).toBeTruthy()
	})
})
