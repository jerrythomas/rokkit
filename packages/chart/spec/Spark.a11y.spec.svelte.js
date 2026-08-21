import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkLabelHarness from './helpers/SparkLabelHarness.svelte'
import Sparkline from '../src/Sparkline.svelte'

/**
 * Cycle 1 shipped every sparkline as a bare `<svg data-spark>` — no role, no accessible
 * name, no text alternative — so all of them were invisible to assistive tech. This is
 * that debt, paid in `Spark.svelte` (which `Sparkline` composes, so both are covered).
 *
 * The generated fallback summary is asserted against the DATA, not against a fixed
 * string: a hardcoded "sparkline" label would satisfy "has an accessible name" while
 * telling a screen-reader user nothing about the series.
 */

const rows = [
	{ x: 0, y: 1 },
	{ x: 1, y: 5 },
	{ x: 2, y: 3 },
	{ x: 3, y: 9 }
]

const svgOf = (container) => container.querySelector('svg[data-spark]')

describe('Spark — accessible role and name', () => {
	it('exposes the glyph as an image to assistive tech', () => {
		const { container } = render(SparkLabelHarness, { data: rows })
		expect(svgOf(container).getAttribute('role')).toBe('img')
	})

	it('uses an explicit label verbatim when one is given', () => {
		const { container } = render(SparkLabelHarness, {
			data: rows,
			label: 'Revenue, last 4 quarters'
		})
		expect(svgOf(container).getAttribute('aria-label')).toBe('Revenue, last 4 quarters')
	})

	it('falls back to a summary built from the data, not a fixed string', () => {
		const { container } = render(SparkLabelHarness, { data: rows })
		const name = svgOf(container).getAttribute('aria-label')

		expect(name).toBeTruthy()
		// Count, endpoints and extent all come from the series itself.
		expect(name).toMatch(/4/) // four readings
		expect(name).toMatch(/\b1\b/) // first value / minimum
		expect(name).toMatch(/\b9\b/) // last value / maximum
		expect(name).not.toMatch(/NaN|undefined/)
	})

	it('describes direction from the endpoints', () => {
		const rising = render(SparkLabelHarness, { data: rows }).container
		const falling = render(SparkLabelHarness, {
			data: [...rows].reverse().map((r, i) => ({ x: i, y: r.y }))
		}).container

		expect(svgOf(rising).getAttribute('aria-label')).toMatch(/ris/i)
		expect(svgOf(falling).getAttribute('aria-label')).toMatch(/fall/i)
	})

	it('produces different names for different series', () => {
		// The assertion that a constant label cannot pass.
		const a = render(SparkLabelHarness, { data: rows }).container
		const b = render(SparkLabelHarness, {
			data: [
				{ x: 0, y: 100 },
				{ x: 1, y: 250 }
			]
		}).container

		expect(svgOf(a).getAttribute('aria-label')).not.toBe(svgOf(b).getAttribute('aria-label'))
	})

	it('names an empty series without emitting NaN', () => {
		const { container } = render(SparkLabelHarness, { data: [] })
		const name = svgOf(container).getAttribute('aria-label')
		expect(name).toBeTruthy()
		expect(name).not.toMatch(/NaN|undefined|Infinity/)
	})
})

describe('Spark — SVG text alternative', () => {
	it('carries a title and a data description inside the svg', () => {
		const { container } = render(SparkLabelHarness, { data: rows })
		const svg = svgOf(container)

		const title = svg.querySelector('title')
		const desc = svg.querySelector('desc')
		expect(title?.textContent?.trim()).toBeTruthy()
		expect(desc?.textContent?.trim()).toBeTruthy()
		// The description is the readable data alternative, so it must carry the values.
		expect(desc.textContent).toMatch(/\b9\b/)
		expect(desc.textContent).not.toMatch(/NaN|undefined/)
	})
})

describe('Sparkline — inherits the fix', () => {
	it('gives a plain numeric sparkline an accessible name', () => {
		// This is the component cycle 1 actually shipped; it composes Spark, so the fix
		// must reach it without Sparkline needing its own a11y implementation.
		const { container } = render(Sparkline, { data: [1, 5, 3, 9] })
		const svg = svgOf(container)
		expect(svg.getAttribute('role')).toBe('img')
		expect(svg.getAttribute('aria-label')).toBeTruthy()
		expect(svg.getAttribute('aria-label')).not.toMatch(/NaN|undefined/)
	})

	it('forwards an explicit label through to the glyph', () => {
		const { container } = render(Sparkline, { data: [1, 5, 3, 9], label: 'Signups this week' })
		expect(svgOf(container).getAttribute('aria-label')).toBe('Signups this week')
	})
})
