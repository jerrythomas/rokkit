import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

	it('hides the code toggle when codeVisible=false', () => {
		pluginDisplay.codeVisible = false
		try {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			expect(container.querySelector('[data-plot-code-toggle]')).toBeFalsy()
		} finally {
			pluginDisplay.codeVisible = true
		}
	})

	it('renders a summary line with rows + channel mapping', () => {
		const { container } = render(PlotPlugin, { props: { code: validSpec } })
		const summary = container.querySelector('[data-plot-summary]')
		const text = summary?.textContent ?? ''
		expect(text).toMatch(/rows\s*\[?2\]?/)
		expect(text).toContain('year')
		expect(text).toContain('revenue')
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

		it('renders CodeBlock as a sibling of the chart when toggled on', async () => {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			const toggle = container.querySelector('[data-plot-code-toggle]') as HTMLElement
			await fireEvent.click(toggle)
			expect(container.querySelector('[data-code-block]')).toBeTruthy()
			expect(container.querySelector('svg')).toBeTruthy()
		})

		it('hides the code panel when toggled off again', async () => {
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			const toggle = container.querySelector('[data-plot-code-toggle]') as HTMLElement
			await fireEvent.click(toggle)
			await fireEvent.click(toggle)
			expect(container.querySelector('svg')).toBeTruthy()
			expect(container.querySelector('[data-code-block]')).toBeFalsy()
		})
	})

	describe('footer actions (copy / download)', () => {
		const origClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
		const origCreate = URL.createObjectURL
		const origRevoke = URL.revokeObjectURL

		beforeEach(() => {
			pluginDisplay.codeVisible = true // the copy/download actions only render when code is visible
		})
		afterEach(() => {
			pluginDisplay.codeVisible = false
			if (origClipboard) Object.defineProperty(navigator, 'clipboard', origClipboard)
			URL.createObjectURL = origCreate
			URL.revokeObjectURL = origRevoke
		})

		it('copies the spec to the clipboard when the copy button is clicked', async () => {
			const writeText = vi.fn().mockResolvedValue(undefined)
			Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			await fireEvent.click(container.querySelector('[title="Copy spec to clipboard"]') as HTMLElement)
			expect(writeText).toHaveBeenCalledTimes(1)
		})

		it('silently ignores a clipboard write failure', async () => {
			const writeText = vi.fn().mockRejectedValue(new Error('insecure context'))
			Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			// Must not throw even though writeText rejects (catch swallows it)
			await fireEvent.click(container.querySelector('[title="Copy spec to clipboard"]') as HTMLElement)
			await Promise.resolve()
			expect(writeText).toHaveBeenCalled()
		})

		it('serializes + downloads the chart svg when the download button is clicked', async () => {
			const createObjectURL = vi.fn(() => 'blob:mock')
			const revokeObjectURL = vi.fn()
			URL.createObjectURL = createObjectURL
			URL.revokeObjectURL = revokeObjectURL
			const { container } = render(PlotPlugin, { props: { code: validSpec } })
			await fireEvent.click(container.querySelector('[title="Download chart as SVG"]') as HTMLElement)
			expect(createObjectURL).toHaveBeenCalledTimes(1)
			expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
		})
	})
})
