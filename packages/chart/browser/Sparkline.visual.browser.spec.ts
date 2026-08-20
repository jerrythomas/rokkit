import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparklineHarness from './fixtures/SparklineHarness.svelte'

/**
 * What this covers that the jsdom suite cannot:
 *
 * The 27 jsdom Sparkline specs assert markup — element counts, `d`/`fill` attribute
 * presence, pattern defs existing — but never what those attributes RESOLVE to once the
 * browser applies CSS custom properties and multiplies fill-color alpha against
 * fill-opacity. A previous task found, by reading the code rather than by any test
 * failing, that an area sparkline's baked-in fill alpha (0.25) was being multiplied by
 * `defaultPreset.opacity.area` (0.6) into an effective ~0.15 — a visible regression every
 * jsdom test passed straight through, because none of them assert `fill-opacity` at all.
 * `getComputedStyle` is the only way to see that multiplication happen; JSDOM does not
 * compute styles for SVG presentation attributes.
 */

/** Parses any `rgb()`/`rgba()` computed-style string (legacy comma or modern space/slash
 *  syntax) into channel numbers. */
function parseRgb(value: string): { r: number; g: number; b: number; a: number } {
	const match = value.match(/rgba?\(([^)]+)\)/)
	if (!match) throw new Error(`not an rgb()/rgba() color: ${value}`)
	const parts = match[1]
		.split(/[,\s/]+/)
		.filter(Boolean)
		.map(Number)
	const [r, g, b, a = 1] = parts
	return { r, g, b, a }
}

describe('Sparkline — area fill renders at its intended opacity, not preset × baked alpha', () => {
	it('resolves the area fill to its baked-in 0.25 alpha, not 0.6 × 0.25 = 0.15', () => {
		const { container } = render(SparklineHarness, {
			data: [10, 20, 30, 15],
			type: 'area',
			color: 'primary'
		})

		const areaPath = container.querySelector('[data-plot-area]')
		expect(areaPath).toBeTruthy()

		const style = getComputedStyle(areaPath as Element)
		const fillOpacity = Number.parseFloat(style.fillOpacity)
		const { a: fillColorAlpha } = parseRgb(style.fill)

		// The number the near-shipped bug was really about: colour-alpha × fill-opacity is
		// what a viewer actually sees painted. 0.6 × 0.25 = 0.15 is the regression this guards
		// (see Sparkline.svelte's `alpha={1}` on its <Area>, and defaultPreset.opacity.area).
		const effectiveAlpha = fillColorAlpha * fillOpacity
		expect(effectiveAlpha).toBeCloseTo(0.25, 2)
	})
})

describe('Sparkline — line stroke resolves to a real, distinct colour', () => {
	it('resolves to a real opaque colour, not none/transparent', () => {
		const { container } = render(SparklineHarness, {
			data: [10, 20, 30],
			type: 'line',
			color: 'primary'
		})

		const line = container.querySelector('[data-plot-element="line"]')
		expect(line).toBeTruthy()

		const stroke = getComputedStyle(line as Element).stroke
		expect(stroke).not.toBe('none')
		const { r, g, b, a } = parseRgb(stroke)
		expect([r, g, b]).toEqual([34, 197, 94]) // --color-primary-500 from the harness
		expect(a).toBeGreaterThan(0)
	})

	it('changes the resolved stroke when `color` changes — not a token-resolution no-op', () => {
		const primary = render(SparklineHarness, { data: [1, 2, 3], type: 'line', color: 'primary' })
		const rose = render(SparklineHarness, { data: [1, 2, 3], type: 'line', color: 'rose' })

		const primaryLine = primary.container.querySelector('[data-plot-element="line"]')
		const roseLine = rose.container.querySelector('[data-plot-element="line"]')
		expect(primaryLine).toBeTruthy()
		expect(roseLine).toBeTruthy()

		const primaryRgb = parseRgb(getComputedStyle(primaryLine as Element).stroke)
		const roseRgb = parseRgb(getComputedStyle(roseLine as Element).stroke)

		// Exact expected values, not merely "the two differ" — a broken resolver that always
		// fell back to the SAME wrong token would still fail an inequality check by accident
		// only if that fallback happened to vary per call. Pinning both to their real,
		// distinct tokens is the assertion that actually distinguishes "resolved correctly"
		// from "coincidentally different."
		expect([primaryRgb.r, primaryRgb.g, primaryRgb.b]).toEqual([34, 197, 94])
		expect([roseRgb.r, roseRgb.g, roseRgb.b]).toEqual([225, 29, 72])
	})
})

describe('Sparkline — patterned area fill resolves to a real pattern, not a dangling reference', () => {
	it('the url(#...) fill points at a <pattern> with real marks', () => {
		const { container } = render(SparklineHarness, {
			data: [10, 20, 5, 15],
			type: 'area',
			pattern: 'dots'
		})

		const areaPaths = [...container.querySelectorAll('[data-plot-area]')]
		expect(areaPaths.length).toBeGreaterThan(0)

		const patterned = areaPaths.find((p) => p.getAttribute('fill')?.startsWith('url('))
		expect(patterned).toBeTruthy()
		// toPatternId('dots') → 'chart-pat-dots' (packages/chart/src/lib/brewing/patterns.js).
		expect(patterned!.getAttribute('fill')).toBe('url(#chart-pat-dots)')

		// Resolve the reference for real — a dangling id would leave the fill invisible even
		// though the `url(...)` attribute itself looks correct.
		const patternEl = container.querySelector('pattern#chart-pat-dots')
		expect(patternEl).toBeTruthy()
		// PATTERNS.dots (packages/chart/src/patterns/patterns.js) is exactly 8 filled circles.
		expect(patternEl!.querySelectorAll('circle').length).toBe(8)
	})
})
