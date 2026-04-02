import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import PlotPlugin from '../src/PlotPlugin.svelte'

const validSpec = JSON.stringify({
	data: [
		{ year: 2023, revenue: 4.2 },
		{ year: 2024, revenue: 4.7 }
	],
	x: 'year',
	y: 'revenue',
	geoms: [{ type: 'bar' }]
})

const facetSpec = JSON.stringify({
	data: [
		{ year: 2023, cat: 'A', v: 1 },
		{ year: 2024, cat: 'B', v: 2 }
	],
	x: 'year',
	y: 'v',
	color: 'cat',
	facet: { by: 'cat', cols: 2 },
	geoms: [{ type: 'bar' }]
})

const animatedSpec = JSON.stringify({
	data: [
		{ year: 2023, v: 1 },
		{ year: 2024, v: 2 }
	],
	x: 'year',
	y: 'v',
	animate: { by: 'year' },
	geoms: [{ type: 'bar' }]
})

describe('PlotPlugin', () => {
	it('renders an SVG chart for valid PlotSpec JSON', () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders an error badge for invalid JSON', () => {
		const { container } = render(PlotPlugin, { props: { code: '{bad json' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('shows raw code in error details', () => {
		const { container } = render(PlotPlugin, { props: { code: 'invalid' } })
		const details = container.querySelector('details')
		expect(details?.textContent).toContain('invalid')
	})

	it('renders FacetPlot when spec has facet field', () => {
		const { container } = render(PlotPlugin, { props: { code: facetSpec } })
		// Should render without error — FacetPlot creates multiple panels
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders AnimatedPlot when spec has animate field', () => {
		const { container } = render(PlotPlugin, { props: { code: animatedSpec } })
		// Should render without error
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('shows raw code when toggle button is clicked', async () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		const toggle = container.querySelector('[data-plot-code-toggle]')!
		await fireEvent.click(toggle)
		expect(container.querySelector('[data-plot-code]')).toBeTruthy()
		expect(container.querySelector('svg')).toBeFalsy()
	})

	it('returns to chart view when toggle is clicked again', async () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		const toggle = container.querySelector('[data-plot-code-toggle]')!
		await fireEvent.click(toggle)
		await fireEvent.click(toggle)
		expect(container.querySelector('svg')).toBeTruthy()
		expect(container.querySelector('[data-plot-code]')).toBeFalsy()
	})
})
