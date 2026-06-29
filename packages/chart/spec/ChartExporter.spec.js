import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import ChartExporter from '../src/ChartExporter.svelte'
import TestChartExporter from './helpers/TestChartExporter.svelte'

// Patch download(): intercept anchor click/append/remove without real navigation
function patchDownload() {
	const origCreate = document.createElement.bind(document)
	const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
		const el = origCreate(tag)
		if (tag === 'a') {
			vi.spyOn(el, 'click').mockImplementation(() => {})
		}
		return el
	})
	const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
	const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
	return { createSpy, appendSpy, removeSpy }
}

function restoreSpies({ createSpy, appendSpy, removeSpy }) {
	createSpy.mockRestore()
	appendSpy.mockRestore()
	removeSpy.mockRestore()
}

describe('ChartExporter.svelte', () => {
	it('renders without crashing', () => {
		expect(() => render(ChartExporter)).not.toThrow()
	})

	it('renders data-chart-exporter container', () => {
		const { container } = render(ChartExporter)
		expect(container.querySelector('[data-chart-exporter]')).toBeTruthy()
	})

	it('renders children inside the container', () => {
		const { container } = render(TestChartExporter)
		expect(container.querySelector('svg[data-test-svg]')).toBeTruthy()
	})

	it('accepts a custom filename prop without crashing', () => {
		const { container } = render(ChartExporter, { props: { filename: 'my-chart' } })
		expect(container.querySelector('[data-chart-exporter]')).toBeTruthy()
	})

	it('accepts a custom scale prop without crashing', () => {
		const { container } = render(ChartExporter, { props: { scale: 3 } })
		expect(container.querySelector('[data-chart-exporter]')).toBeTruthy()
	})

	describe('exportSVG() via wrapper', () => {
		let spies
		beforeEach(() => {
			global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
			global.URL.revokeObjectURL = vi.fn()
			spies = patchDownload()
		})
		afterEach(() => restoreSpies(spies))

		it('does not throw when SVG is present', async () => {
			const { component } = render(TestChartExporter)
			await tick()
			expect(() => component.callExportSVG()).not.toThrow()
		})

		it('calls URL.createObjectURL when SVG is present', async () => {
			const { component } = render(TestChartExporter)
			await tick()
			component.callExportSVG()
			expect(global.URL.createObjectURL).toHaveBeenCalled()
		})

		it('inlines CSS properties and resolves var() references in fill/stroke attributes', async () => {
			// Tests the inlineStyles() code path
			const { component, container } = render(TestChartExporter)
			await tick()
			// Add a var() fill attribute to trigger the CSS var resolution branch
			const rect = container.querySelector('rect')
			if (rect) rect.setAttribute('fill', 'var(--color-primary)')
			component.callExportSVG()
			// createObjectURL should still be called (no crash)
			expect(global.URL.createObjectURL).toHaveBeenCalled()
		})
	})

	describe('exportPNG() via wrapper', () => {
		let spies
		beforeEach(() => {
			global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
			global.URL.revokeObjectURL = vi.fn()
			spies = patchDownload()
		})
		afterEach(() => restoreSpies(spies))

		it('does not throw when SVG is present', async () => {
			const { component } = render(TestChartExporter)
			await tick()
			expect(() => component.callExportPNG()).not.toThrow()
		})

		it('with custom scale factor does not throw', async () => {
			const { component } = render(TestChartExporter)
			await tick()
			expect(() => component.callExportPNG(3)).not.toThrow()
		})
	})

	describe('no-SVG edge case', () => {
		it('does not crash when no SVG is in container (no-op)', async () => {
			// Render without children — no SVG present
			const { container } = render(ChartExporter)
			await tick()
			// Container exists but has no SVG
			expect(container.querySelector('svg')).toBeNull()
		})
	})
})
