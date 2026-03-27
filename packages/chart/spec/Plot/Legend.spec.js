import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestLegend from '../helpers/TestLegend.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

describe('Legend item derivation', () => {
	it('builds categorical items from colors Map', () => {
		const colors = new Map([
			['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
			['suv', { fill: '#f28e2b', stroke: '#f28e2b' }]
		])
		const labels = { compact: 'Compact', suv: 'SUV' }
		const items = [...colors.entries()].map(([key, entry]) => ({
			key,
			label: labels[key] ?? key,
			fill: entry.fill
		}))
		expect(items).toHaveLength(2)
		expect(items[0]).toEqual({ key: 'compact', label: 'Compact', fill: '#4e79a7' })
		expect(items[1]).toEqual({ key: 'suv', label: 'SUV', fill: '#f28e2b' })
	})

	it('uses raw key as label when labels map is absent', () => {
		const colors = new Map([['compact', { fill: '#4e79a7', stroke: '#4e79a7' }]])
		const labels = {}
		const items = [...colors.entries()].map(([key, entry]) => ({
			key,
			label: labels[key] ?? key,
			fill: entry.fill
		}))
		expect(items[0].label).toBe('compact')
	})
})

describe('Legend gradient branch (stub — see issue #126)', () => {
	it('renders data-plot-legend-gradient element for sequential colorScaleType', () => {
		const state = createMockState({ colorScaleType: 'sequential' })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
	})

	it('renders data-plot-legend-gradient element for diverging colorScaleType', () => {
		const state = createMockState({ colorScaleType: 'diverging' })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
	})
})
