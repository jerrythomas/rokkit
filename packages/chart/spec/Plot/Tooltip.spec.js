import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import TestTooltip from '../helpers/TestTooltip.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

function makeState(overrides = {}) {
	return createMockState({ hovered: null, mode: 'light', ...overrides })
}

describe('Plot/Tooltip.svelte', () => {
	it('renders without crashing when nothing is hovered', () => {
		const state = makeState({ hovered: null })
		expect(() => render(TestTooltip, { props: { state } })).not.toThrow()
	})

	it('does not render tooltip when hovered is null', () => {
		const state = makeState({ hovered: null })
		const { container } = render(TestTooltip, { props: { state } })
		expect(container.querySelector('.plot-tooltip')).toBeNull()
	})

	it('renders tooltip div when a row is hovered', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 } })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		expect(container.querySelector('.plot-tooltip')).toBeTruthy()
	})

	it('applies data-mode="light" in light mode', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 }, mode: 'light' })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		expect(container.querySelector('[data-mode="light"]')).toBeTruthy()
	})

	it('applies data-mode="dark" in dark mode', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 }, mode: 'dark' })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		expect(container.querySelector('[data-mode="dark"]')).toBeTruthy()
	})

	it('formats hovered row as key/value pairs by default', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 } })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		const tooltip = container.querySelector('.plot-tooltip')
		expect(tooltip.innerHTML).toContain('class')
		expect(tooltip.innerHTML).toContain('hwy')
	})

	it('filters null values from default format', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: null, displ: undefined, cyl: 4 } })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		const tooltip = container.querySelector('.plot-tooltip')
		// null/undefined entries should be filtered from output
		expect(tooltip.innerHTML).toContain('class')
		expect(tooltip.innerHTML).toContain('cyl')
		// null itself should not appear
		expect(tooltip.innerHTML).not.toContain('>null<')
	})

	it('uses custom tooltip function when provided', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 } })
		const customTooltip = (d) => `<strong>${d.class}: ${d.hwy}</strong>`
		const { container } = render(TestTooltip, { props: { state, tooltip: customTooltip } })
		await tick()
		const tooltip = container.querySelector('.plot-tooltip')
		expect(tooltip.innerHTML).toContain('compact: 29')
	})

	it('tracks mouse position and positions tooltip with offset', async () => {
		const state = makeState({ hovered: { class: 'compact', hwy: 29 } })
		const { container } = render(TestTooltip, { props: { state } })
		await tick()
		fireEvent.mouseMove(window, { clientX: 100, clientY: 80 })
		await tick()
		const tooltip = container.querySelector('.plot-tooltip')
		expect(tooltip.style.left).toBe('114px')  // clientX + 14
		expect(tooltip.style.top).toBe('72px')    // clientY - 8
	})

	it('renders nothing when content is empty string from custom function', async () => {
		const state = makeState({ hovered: { class: 'compact' } })
		const customTooltip = () => ''
		const { container } = render(TestTooltip, { props: { state, tooltip: customTooltip } })
		await tick()
		// Empty content means tooltip should not show
		expect(container.querySelector('.plot-tooltip')).toBeNull()
	})
})
