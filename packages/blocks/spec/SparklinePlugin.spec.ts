import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparklinePlugin from '../src/SparklinePlugin.svelte'

const validSpec = JSON.stringify({
	data: [10, 20, 15, 30],
	type: 'line'
})

// A mixed-sign series so a bar baseline is meaningful and min/max markers land
// on obvious points.
const MIXED = [12, -8, 23, -17, 34, 56, -9, 41]

describe('SparklinePlugin', () => {
	it('renders an SVG', () => {
		const { container } = render(SparklinePlugin, { props: { code: validSpec } })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders error badge for invalid JSON', () => {
		const { container } = render(SparklinePlugin, { props: { code: 'bad' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('wraps a valid render in the [data-sparkline-plugin] hook', () => {
		const { container } = render(SparklinePlugin, { props: { code: validSpec } })
		const wrap = container.querySelector('[data-sparkline-plugin]')
		expect(wrap).toBeTruthy()
		expect(wrap?.querySelector('svg')).toBeTruthy()
	})

	// The plugin spreads the parsed JSON straight into @rokkit/chart's canonical
	// Sparkline (the single source of truth, #149), so the enriched v1.3.14 props
	// must reach the component and render their marks. These are the forwarding
	// contract — a regression here means the plugin diverged from the component.
	it('forwards `baseline` → renders the baseline reference rule', () => {
		const code = JSON.stringify({ data: MIXED, type: 'bar', baseline: 0 })
		const { container } = render(SparklinePlugin, { props: { code } })
		expect(container.querySelector('[data-plot-baseline]')).toBeTruthy()
	})

	it('forwards `highlight` → renders highlight markers', () => {
		const code = JSON.stringify({ data: MIXED, type: 'line', highlight: ['min', 'max'] })
		const { container } = render(SparklinePlugin, { props: { code } })
		expect(container.querySelector('[data-plot-highlight]')).toBeTruthy()
	})

	it('forwards `trend` → renders the trend line', () => {
		const code = JSON.stringify({ data: MIXED, type: 'line', trend: 'linear' })
		const { container } = render(SparklinePlugin, { props: { code } })
		expect(container.querySelector('[data-plot-geom="trend"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-trend]')).toBeTruthy()
	})

	it('renders a titled card (figure + caption) when `title` is set, without passing it to the component', () => {
		const code = JSON.stringify({ data: [1, 2, 3], type: 'line', title: 'Signups' })
		const { container } = render(SparklinePlugin, { props: { code } })
		const card = container.querySelector('[data-sparkline-plugin]')
		expect(card?.tagName.toLowerCase()).toBe('figure')
		expect(container.querySelector('[data-sparkline-caption]')?.textContent).toBe('Signups')
		expect(container.querySelector('svg')).toBeTruthy()
	})
})
