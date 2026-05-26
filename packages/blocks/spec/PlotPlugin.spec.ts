import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import PlotPlugin from '../src/PlotPlugin.svelte'
import { pluginDisplay } from '../src/config.svelte.js'

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

	it('hides the code toggle by default (codeVisible=false)', () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		expect(container.querySelector('[data-plot-code-toggle]')).toBeFalsy()
	})

	it('renders a summary line with rows + channel mapping', () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		const summary = container.querySelector('[data-plot-summary]')
		expect(summary?.textContent).toContain('rows=2')
		expect(summary?.textContent).toContain('x=year')
		expect(summary?.textContent).toContain('y=revenue')
	})

	describe('with codeVisible=true', () => {
		beforeEach(() => {
			pluginDisplay.codeVisible = true
		})
		afterEach(() => {
			pluginDisplay.codeVisible = false
		})

		it('exposes the view-code toggle', () => {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			expect(container.querySelector('[data-plot-code-toggle]')).toBeTruthy()
		})

		it('shows code BELOW the chart when toggled on (chart stays visible)', async () => {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			const toggle = container.querySelector('[data-plot-code-toggle]') as HTMLElement
			await fireEvent.click(toggle)
			expect(container.querySelector('[data-plot-code]')).toBeTruthy()
			expect(container.querySelector('svg')).toBeTruthy()
		})

		it('hides the code panel when toggled off again', async () => {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			const toggle = container.querySelector('[data-plot-code-toggle]') as HTMLElement
			await fireEvent.click(toggle)
			await fireEvent.click(toggle)
			expect(container.querySelector('svg')).toBeTruthy()
			expect(container.querySelector('[data-plot-code]')).toBeFalsy()
		})
	})
})
