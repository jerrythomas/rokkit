import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChartProvider from '../src/ChartProvider.svelte'
import TestChartProvider from './helpers/TestChartProvider.svelte'
import { createChartPreset } from '../src/lib/preset.js'

describe('ChartProvider.svelte', () => {
	it('renders without crashing', () => {
		expect(() => render(ChartProvider)).not.toThrow()
	})

	it('renders children slot', () => {
		const { container } = render(TestChartProvider)
		expect(container.querySelector('[data-testid="preset-consumer"]')).toBeTruthy()
	})

	it('sets chart-preset context for consumers', () => {
		const { container } = render(TestChartProvider)
		const child = container.querySelector('[data-testid="preset-consumer"]')
		expect(child.getAttribute('data-preset-set')).toBe('true')
	})

	it('works with default preset (no prop)', () => {
		const { container } = render(TestChartProvider)
		expect(container.querySelector('[data-testid="preset-consumer"]')).toBeTruthy()
	})

	it('works with a custom preset prop', () => {
		const customPreset = createChartPreset({ colors: ['red', 'blue'] })
		const { container } = render(TestChartProvider, { props: { preset: customPreset } })
		const child = container.querySelector('[data-testid="preset-consumer"]')
		expect(child.getAttribute('data-preset-set')).toBe('true')
	})

	it('renders nothing additional without children', () => {
		const { container } = render(ChartProvider)
		// ChartProvider itself has no markup — just renders children
		expect(container).toBeTruthy()
	})
})
