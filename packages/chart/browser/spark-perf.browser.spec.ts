import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkGrid from './fixtures/SparkGrid.svelte'
import PlotGrid from './fixtures/PlotGrid.svelte'
import { SparkState } from '../src/SparkState.svelte.js'
import { PlotState } from '../src/PlotState.svelte.js'

/**
 * Measures the perf claim behind the Spark/Plot geom-composition design (see
 * docs/superpowers/specs/2026-08-20-spark-plot-geom-architecture-design.md's risk table):
 * that `SparkState` is cheap enough for "a table column of sparklines" — hundreds of inline
 * instances — because it omits most of what `PlotState` carries (zoom, crossfilter,
 * selection, facets, symbols, tooltip/format/label helpers, axis positions, orientation
 * flipping, animation gating). The design spec commits to REPORTING this number, even if it
 * doesn't favour Spark — the composition win (one render path instead of two) stands on its
 * own regardless.
 *
 * Two measurements, deliberately kept apart:
 *
 * 1. Render time — mounting `count` real components into real Chromium (needs browser mode:
 *    jsdom has no layout engine, but more importantly here we want a REAL mount/effect-flush
 *    cost, not a stubbed one). This conflates state construction with DOM work.
 * 2. Instance construction — `new SparkState(...)` vs `new PlotState(...)` directly, no
 *    rendering at all. This isolates the actual claim (the context object is lighter) from
 *    DOM cost, which likely dominates at this element count regardless of container weight.
 *
 * Methodology, matching the design spec's "get this right or the number is worthless" list:
 *  - warm up once per fixture/class and discard that sample (module init + JIT warmup would
 *    otherwise swamp the comparison)
 *  - take several samples (5, well over the 3 minimum) and report the MEDIAN, not one run —
 *    a single sample's noise floor is bigger than the effect being measured
 *  - alternate Spark/Plot on every round so cache warming never systematically favours
 *    whichever fixture/class happens to run first
 *
 * No performance threshold is asserted — only that both fixtures actually rendered 200 line
 * geoms (a silently-empty fixture would be very fast and would make the timing meaningless).
 * The numbers are logged so they show up in the run output and can be pasted into the commit.
 */

const CELLS = 200
const SAMPLES = 5

// Shared rows across every cell in a fixture — mirrors a real table column, which reuses one
// dataset shape across many rows, not `count` distinct datasets.
const rows = Array.from({ length: 20 }, (_, i) => ({
	x: i,
	y: Math.round(50 + 40 * Math.sin(i / 2.3))
}))

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

type Fixture = typeof SparkGrid | typeof PlotGrid

/** Times ONLY the `render(...)` call (mount + Svelte's synchronous effect flush), then
 *  unmounts before returning so each sample starts from a clean DOM. Counts the rendered
 *  line geoms so the caller can confirm the fixture actually did something before trusting
 *  the timing. */
function timeRender(Fixture: Fixture): { elapsedMs: number; lineGeomCount: number } {
	const start = performance.now()
	const { container, unmount } = render(Fixture, { count: CELLS, data: rows })
	const elapsedMs = performance.now() - start
	const lineGeomCount = container.querySelectorAll('[data-plot-geom="line"]').length
	unmount()
	return { elapsedMs, lineGeomCount }
}

/** Times constructing `CELLS` instances of a PlotState-shaped class back-to-back, with no
 *  rendering at all. */
function timeConstruction(Ctor: new (config: Record<string, unknown>) => unknown, config: Record<string, unknown>): number {
	const start = performance.now()
	for (let i = 0; i < CELLS; i++) {
		new Ctor(config)
	}
	return performance.now() - start
}

describe('Spark vs Plot — table-scale cost (200 cells)', () => {
	it('renders 200/200 line geoms in both fixtures and reports render-time + instance-construction medians', () => {
		// ── Warm up (discarded): first render/construction pays for module init and JIT
		// warmup that would swamp a same-order comparison.
		timeRender(SparkGrid)
		timeRender(PlotGrid)

		// ── Render time: SAMPLES rounds, alternating Spark then Plot each round.
		const sparkRenderTimes: number[] = []
		const plotRenderTimes: number[] = []
		let sparkGeomCount = 0
		let plotGeomCount = 0
		for (let round = 0; round < SAMPLES; round++) {
			const spark = timeRender(SparkGrid)
			sparkRenderTimes.push(spark.elapsedMs)
			sparkGeomCount = spark.lineGeomCount

			const plot = timeRender(PlotGrid)
			plotRenderTimes.push(plot.elapsedMs)
			plotGeomCount = plot.lineGeomCount
		}

		// Confirm both fixtures actually rendered something before trusting any timing — a
		// fixture that silently renders nothing is very fast.
		expect(sparkGeomCount).toBe(CELLS)
		expect(plotGeomCount).toBe(CELLS)

		const sparkRenderMedian = median(sparkRenderTimes)
		const plotRenderMedian = median(plotRenderTimes)

		// ── Instance construction: same config shape (data/channels/width/height), no DOM at
		// all. Isolates the state-object weight the design claim is actually about.
		const sparkConfig = { data: rows, channels: { x: 'x', y: 'y' }, width: 80, height: 24 }
		const plotConfig = {
			data: rows,
			channels: { x: 'x', y: 'y' },
			width: 80,
			height: 24,
			margin: { top: 0, right: 0, bottom: 0, left: 0 }
		}

		timeConstruction(SparkState, sparkConfig)
		timeConstruction(PlotState, plotConfig)

		const sparkCtorTimes: number[] = []
		const plotCtorTimes: number[] = []
		for (let round = 0; round < SAMPLES; round++) {
			sparkCtorTimes.push(timeConstruction(SparkState, sparkConfig))
			plotCtorTimes.push(timeConstruction(PlotState, plotConfig))
		}

		const sparkCtorMedian = median(sparkCtorTimes)
		const plotCtorMedian = median(plotCtorTimes)

		const fmt = (n: number) => n.toFixed(2)
		console.log(
			[
				'',
				`[spark-perf] ${CELLS} cells, ${SAMPLES} alternating samples per measure (medians):`,
				`  render time — Spark: ${fmt(sparkRenderMedian)}ms  Plot: ${fmt(plotRenderMedian)}ms  (Plot/Spark: ${fmt(plotRenderMedian / sparkRenderMedian)}x)`,
				`    Spark samples: [${sparkRenderTimes.map(fmt).join(', ')}]`,
				`    Plot  samples: [${plotRenderTimes.map(fmt).join(', ')}]`,
				`  instance construction — Spark: ${fmt(sparkCtorMedian)}ms  Plot: ${fmt(plotCtorMedian)}ms  (Plot/Spark: ${fmt(plotCtorMedian / sparkCtorMedian)}x)`,
				`    Spark samples: [${sparkCtorTimes.map(fmt).join(', ')}]`,
				`    Plot  samples: [${plotCtorTimes.map(fmt).join(', ')}]`
			].join('\n')
		)

		// Deliberately NO performance-threshold assertion: machine variance makes that
		// flaky, and a flaky perf gate in CI teaches people to ignore CI. The numbers above
		// are the deliverable — see the commit message for the interpretation.
	})
})
