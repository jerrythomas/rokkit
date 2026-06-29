import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import TestRibbon from '../helpers/TestRibbon.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const SANKEY_DATA = [
	{ source: 'A', target: 'X', value: 10 },
	{ source: 'A', target: 'Y', value: 5 },
	{ source: 'B', target: 'X', value: 8 },
	{ source: 'B', target: 'Y', value: 3 }
]

function ribbonState(overrides = {}) {
	return createMockState({
		colors: new Map([
			['A', { fill: '#4e79a7', stroke: '#4e79a7' }],
			['B', { fill: '#f28e2b', stroke: '#f28e2b' }]
		]),
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Ribbon.svelte', () => {
	it('renders nothing when data is empty', () => {
		const state = ribbonState({ geomData: () => [] })
		const { container } = render(TestRibbon, { props: { state } })
		expect(container.querySelector('[data-plot-geom="ribbon"]')).toBeNull()
	})

	it('renders a ribbon group for non-empty data', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		expect(container.querySelector('[data-plot-geom="ribbon"]')).toBeTruthy()
	})

	it('renders one path per flow (link)', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const paths = container.querySelectorAll('[data-plot-element="ribbon"]')
		expect(paths.length).toBe(SANKEY_DATA.length)
	})

	it('ribbon paths have a d attribute (cubic bezier path)', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const firstPath = container.querySelector('[data-plot-element="ribbon"]')
		expect(firstPath.getAttribute('d')).toMatch(/^M/)
	})

	it('ribbon paths have opacity="0.5"', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const firstPath = container.querySelector('[data-plot-element="ribbon"]')
		expect(firstPath.getAttribute('opacity')).toBe('0.5')
	})

	it('renders source node labels', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const labels = container.querySelectorAll('[data-plot-element="node-label"]')
		expect(labels.length).toBeGreaterThan(0)
	})

	it('renders a <title> for each ribbon', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const titles = container.querySelectorAll('[data-plot-element="ribbon"] title')
		expect(titles.length).toBe(SANKEY_DATA.length)
		// Title should contain source → target
		expect(titles[0].textContent).toContain('→')
	})

	it('uses source color when available in colors map', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		const { container } = render(TestRibbon, { props: { state } })
		const firstRibbon = container.querySelector('[data-plot-element="ribbon"]')
		// Source A has fill '#4e79a7'
		expect(firstRibbon.getAttribute('fill')).toBe('#4e79a7')
	})

	it('falls back to #888 when source and target colors not in map', () => {
		const state = ribbonState({
			geomData: () => [{ source: 'Unknown', target: 'Also', value: 5 }],
			colors: new Map()
		})
		const { container } = render(TestRibbon, { props: { state } })
		const ribbon = container.querySelector('[data-plot-element="ribbon"]')
		expect(ribbon.getAttribute('fill')).toBe('#888')
	})

	it('uses custom source/target/value field names via options', () => {
		const data = [{ src: 'A', tgt: 'X', amount: 10 }]
		const state = ribbonState({
			geomData: () => data,
			colors: new Map([['A', { fill: 'green', stroke: 'green' }]])
		})
		const { container } = render(TestRibbon, {
			props: { state, options: { source: 'src', target: 'tgt', value: 'amount' } }
		})
		expect(container.querySelector('[data-plot-geom="ribbon"]')).toBeTruthy()
		const ribbon = container.querySelector('[data-plot-element="ribbon"]')
		expect(ribbon.getAttribute('fill')).toBe('green')
	})

	it('calls setHovered on mouseenter', async () => {
		let hovered = null
		const state = ribbonState({
			geomData: () => SANKEY_DATA,
			setHovered: (d) => { hovered = d }
		})
		const { container } = render(TestRibbon, { props: { state } })
		const firstRibbon = container.querySelector('[data-plot-element="ribbon"]')
		await fireEvent.mouseEnter(firstRibbon)
		expect(hovered).not.toBeNull()
	})

	it('calls clearHovered on mouseleave', async () => {
		let cleared = false
		const state = ribbonState({
			geomData: () => SANKEY_DATA,
			clearHovered: () => { cleared = true }
		})
		const { container } = render(TestRibbon, { props: { state } })
		const firstRibbon = container.querySelector('[data-plot-element="ribbon"]')
		await fireEvent.mouseLeave(firstRibbon)
		expect(cleared).toBe(true)
	})

	it('uses fill prop (fillProp) over color prop for color channel', () => {
		const state = ribbonState({ geomData: () => SANKEY_DATA })
		// Just ensure rendering with fill prop does not throw
		expect(() =>
			render(TestRibbon, { props: { state, fill: 'source' } })
		).not.toThrow()
	})
})
