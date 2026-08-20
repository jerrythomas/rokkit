import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkHarness from './helpers/SparkHarness.svelte'
import SparkAreaPatternHarness from './helpers/SparkAreaPatternHarness.svelte'
import { toPatternId } from '../src/lib/brewing/patterns.js'
import { PATTERNS } from '../src/patterns/patterns.js'

/**
 * `Spark` is the first container to actually drive a real geom off `SparkState` — the
 * conformance test (`spec/spark-contract.spec.js`) only proves the two states have the same
 * shape, not that a live geom renders correctly through one. `SparkHarness` composes a real
 * `<Line />` inside `<Spark>`, so these tests are the integration check that closes that gap.
 *
 * Pixel values below are chosen so they're hand-computable and exact — not just "truthy" —
 * per the plan's test-quality rule: assert the value the feature computes, not a property
 * that would also hold if the feature were broken.
 */

const rows = [
	{ day: 0, sales: 10 },
	{ day: 1, sales: 20 },
	{ day: 2, sales: 30 }
]

// Pulls the last `M`/`L` coordinate pair out of an SVG path's `d` attribute, e.g. the last
// point of "M0,40L50,20L100,0" is {x: 100, y: 0}. Used to prove the geom's rendered geometry
// — not merely its presence — reflects the current props.
function lastPoint(d) {
	const matches = [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)]
	const [, x, y] = matches[matches.length - 1]
	return { x: Number(x), y: Number(y) }
}

function linePath(container) {
	return container.querySelector('[data-plot-geom="line"] path[data-plot-element="line"]')
}

describe('Spark container — dimensions', () => {
	it('renders an svg at the given width and height', () => {
		const { container } = render(SparkHarness, { data: rows, width: 120, height: 32 })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('120')
		expect(svg.getAttribute('height')).toBe('32')
	})

	it('defaults to 80x24 when width/height are not given', () => {
		const { container } = render(SparkHarness, { data: rows })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('80')
		expect(svg.getAttribute('height')).toBe('24')
	})
})

describe('Spark container — no chrome', () => {
	it('renders no axes, grid, or legend', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('[data-plot-axis]')).toBeNull()
		expect(container.querySelector('[data-plot-grid]')).toBeNull()
		expect(container.querySelector('[data-plot-legend]')).toBeNull()
	})
})

describe('Spark container — geom composition (the real integration check)', () => {
	it('provides working context so a real child geom renders actual geometry', () => {
		const { container } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		const g = container.querySelector('[data-plot-geom="line"]')
		expect(g).toBeTruthy()
		const path = linePath(container)
		expect(path).toBeTruthy()
		const d = path.getAttribute('d')
		expect(d).toBeTruthy()
		expect(d).not.toContain('NaN')
		// xScale domain [0,2] range [0,100] (nice:false) → the last row (day 2) maps to x=100
		// exactly; yScale domain [10,30] range [40,0] → sales=30 (the max) maps to y=0 exactly.
		// A stubbed/broken context (e.g. no xScale/yScale) could not produce this exact pair.
		expect(lastPoint(d)).toEqual({ x: 100, y: 0 })
	})
})

describe('Spark container — pattern defs', () => {
	it('renders the pattern-defs container so pattern fills can resolve, same as PlotSurface', () => {
		const { container } = render(SparkHarness, { data: rows })
		// SparkHarness never sets a `pattern` prop here, so SparkState.patterns is an empty
		// Map for this render and no <pattern> actually appears — but the <defs>/
		// <DefinePatterns/> wiring itself must be present unconditionally so a consumer's
		// pattern resolves the moment one is composed (see the integration block below for
		// the non-empty, pattern-actually-renders case).
		expect(container.querySelector('defs')).toBeTruthy()
	})
})

describe('Spark container — literal pattern fill (integration)', () => {
	// SparkState.patterns self-maps a literal `pattern` prop (`Map([[name, name]])`) rather
	// than assigning by index — proven here against a REAL <Spark> wrapping a REAL <Area>,
	// not a mock plot-state, so a wrong mechanism (e.g. `assignPatterns`, which would
	// substitute PATTERN_ORDER[0] regardless of what was asked for) fails this test.
	const texturedRows = [
		{ day: 0, sales: 10, texture: 'diagonal' },
		{ day: 1, sales: 20, texture: 'diagonal' }
	]

	it('resolves the area fill to exactly url(#chart-pat-diagonal), built from toPatternId', () => {
		const { container } = render(SparkAreaPatternHarness, {
			data: texturedRows,
			pattern: 'diagonal',
			areaPattern: 'texture',
			width: 100,
			height: 40
		})

		const areaElements = container.querySelectorAll('[data-plot-area]')
		expect(areaElements.length).toBeGreaterThan(0)
		const patterned = [...areaElements].find((el) => el.getAttribute('fill')?.startsWith('url('))
		expect(patterned).toBeTruthy()
		expect(patterned.getAttribute('fill')).toBe(`url(#${toPatternId('diagonal')})`)
	})

	it('renders "hatch"\'s own marks, not "diagonal"\'s — guards against assignPatterns substituting PATTERN_ORDER[0]', () => {
		// The rendered <pattern>'s id is keyed by the Map KEY (the literal name itself), which
		// `assignPatterns([pattern])` leaves untouched — only the Map VALUE (which pattern's
		// marks get drawn) would silently change to PATTERN_ORDER[0] ('diagonal'). So a fill-id
		// assertion alone can't catch that substitution; this asserts on the pattern's actual
		// mark count instead. 'hatch' (6 <line> marks) vs 'diagonal' (3 <line> marks) makes the
		// two unmistakably different — and 'hatch' isn't PATTERN_ORDER[0], so there's no
		// coincidental match the way there would be with 'diagonal'.
		const hatchRows = [
			{ day: 0, sales: 10, texture: 'hatch' },
			{ day: 1, sales: 20, texture: 'hatch' }
		]
		const { container } = render(SparkAreaPatternHarness, {
			data: hatchRows,
			pattern: 'hatch',
			areaPattern: 'texture',
			width: 100,
			height: 40
		})

		const areaElements = container.querySelectorAll('[data-plot-area]')
		expect(areaElements.length).toBeGreaterThan(0)
		const patterned = [...areaElements].find((el) => el.getAttribute('fill')?.startsWith('url('))
		expect(patterned).toBeTruthy()
		expect(patterned.getAttribute('fill')).toBe(`url(#${toPatternId('hatch')})`)

		const patternDef = container.querySelector(`pattern#${toPatternId('hatch')}`)
		expect(patternDef).toBeTruthy()
		const hatchLineCount = PATTERNS.hatch.filter((m) => m.type === 'line').length
		expect(hatchLineCount).toBeGreaterThan(0)
		expect(patternDef.querySelectorAll('line').length).toBe(hatchLineCount)
	})

	it('renders the actual <pattern> def the fill references', () => {
		const { container } = render(SparkAreaPatternHarness, {
			data: texturedRows,
			pattern: 'diagonal',
			areaPattern: 'texture',
			width: 100,
			height: 40
		})

		const patternDef = container.querySelector('defs pattern')
		expect(patternDef).toBeTruthy()
		expect(patternDef.getAttribute('id')).toBe(toPatternId('diagonal'))
	})

	it('does not resolve a pattern fill when the Area row names a pattern Spark was not given', () => {
		const { container } = render(SparkAreaPatternHarness, {
			data: [
				{ day: 0, sales: 10, texture: 'hatch' },
				{ day: 1, sales: 20, texture: 'hatch' }
			],
			pattern: 'diagonal', // Spark only self-maps 'diagonal' — 'hatch' has no Map entry
			areaPattern: 'texture',
			width: 100,
			height: 40
		})

		const areaElements = container.querySelectorAll('[data-plot-area]')
		expect(areaElements.length).toBeGreaterThan(0)
		const patterned = [...areaElements].find((el) => el.getAttribute('fill')?.startsWith('url('))
		expect(patterned).toBeUndefined()
	})
})

describe('Spark container — baseline', () => {
	it('omits the baseline line when no baseline is given', () => {
		const { container } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		expect(container.querySelector('[data-plot-baseline]')).toBeNull()
	})

	it('draws the baseline line at the exact scaled pixel, not a hardcoded position', () => {
		const { container } = render(SparkHarness, {
			data: rows,
			width: 100,
			height: 40,
			baseline: 20
		})
		const line = container.querySelector('[data-plot-baseline]')
		expect(line).toBeTruthy()
		// yScale domain [10,30] range [40,0] (nice:false) → yScale(20) = 40 - 0.5*40 = 20 exactly.
		// A hardcoded y=0 (or any value other than the scaled pixel) fails this.
		expect(line.getAttribute('y1')).toBe('20')
		expect(line.getAttribute('y2')).toBe('20')
		expect(line.getAttribute('x1')).toBe('0')
		expect(line.getAttribute('x2')).toBe('100')
	})
})

describe('Spark container — live prop updates', () => {
	it('flows a width change through the $effect to both the svg and the rendered geometry', async () => {
		const { container, rerender } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		const svg = container.querySelector('svg')

		const before = lastPoint(linePath(container).getAttribute('d'))
		expect(before.x).toBe(100) // xScale range [0,100] → last point at x=100

		await rerender({ data: rows, width: 200, height: 40 })

		expect(svg.getAttribute('width')).toBe('200')
		const after = lastPoint(linePath(container).getAttribute('d'))
		// If the $effect didn't re-run state.update(), xScale's range would still be [0,100]
		// and this would still read 100 even though the svg's own width attribute changed.
		expect(after.x).toBe(200)
	})

	it('flows a baseline prop change through to the reference line pixel', async () => {
		const { container, rerender } = render(SparkHarness, {
			data: rows,
			width: 100,
			height: 40,
			baseline: 20
		})
		expect(container.querySelector('[data-plot-baseline]').getAttribute('y1')).toBe('20')

		// yScale domain [10,30] range [40,0] → yScale(10) = 40 exactly.
		await rerender({ data: rows, width: 100, height: 40, baseline: 10 })
		expect(container.querySelector('[data-plot-baseline]').getAttribute('y1')).toBe('40')
	})
})
