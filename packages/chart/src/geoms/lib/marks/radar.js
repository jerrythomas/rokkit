import { lineRadial, curveLinearClosed } from 'd3-shape'
import { buildRadarLayout } from '../../../lib/brewing/polar.js'
import { resolveFillStroke, resolveAlpha } from '../aesthetics.js'
import { toPatternId } from '../../../lib/brewing/patterns.js'

// Space reserved outside the outer ring for axis labels, in pixels. `buildArcs` (the pie/donut
// adapter) reserves none because a pie's labels sit INSIDE the wedge; a radar's axis labels sit
// OUTSIDE the outer ring (beyond the last vertex), so the plotted radius has to stop short of
// `min(width, height) / 2` or a spoke's label collides with the plot's own edge. This is a fixed
// pixel budget (rather than a fraction of R) because label text is a roughly fixed size
// regardless of how big the plot is.
const LABEL_MARGIN = 32

/**
 * Converts `polar.js`'s angle convention (degrees, -90 = top, increasing clockwise) to
 * `lineRadial`'s (radians, 0 = top/12 o'clock, increasing clockwise).
 *
 * Both conventions already agree on the direction of travel (clockwise), so the only
 * difference is where zero sits: polar.js's zero (3 o'clock) is a quarter turn AFTER
 * lineRadial's zero (12 o'clock). Rotating polar.js's angle forward by the 90° between
 * them, then converting to radians, aligns the two: `-90°` (polar.js's top) maps to `0`
 * (lineRadial's top).
 *
 * @param {number} degrees - polar.js convention, -90 = top
 * @returns {number} radians, 0 = top, for `lineRadial`'s `.angle()`
 */
function toRadialAngle(degrees) {
	return ((degrees + 90) * Math.PI) / 180
}

/**
 * Build renderable radar/spider polygon marks: one closed polygon per series, split into a
 * fill-only copy and a stroke-only copy so every series' fill can be drawn before any series'
 * stroke (see the return-order note below).
 *
 * Geometry comes from the pure `buildRadarLayout` (shared with the `Spark` radar form); this
 * adapter's job is purely the Svelte/Plot-facing plumbing: deriving the outer radius from the
 * plot's actual pixel size, resolving each series' fill/stroke/pattern through the shared
 * palette, and applying the geom's alpha.
 *
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 * @returns {{ d: string, fill: string, stroke: string, alpha: number, key: string, patternId: string|null }[]}
 *   Fill marks (stroke: 'none') for every series, followed by stroke marks (fill: 'none') for
 *   every series — never interleaved. A smaller series nested inside a larger one would have its
 *   outline buried under the next series' fill if fills and strokes were paired up per series
 *   instead, so paint order is fills-then-strokes across the WHOLE series set, not per series.
 */
export function buildRadarMarks({ data, plot, channels, options = {}, alpha, type = 'radar' }) {
	if (!data?.length || !channels?.x || !channels?.y) return []

	const { innerWidth, innerHeight, colors, patterns, chartPreset } = plot

	const rawR = Math.min(innerWidth, innerHeight) / 2
	const R = Math.max(0, rawR - LABEL_MARGIN)

	const layout = buildRadarLayout(data, channels, {
		axes: options.axes,
		sharedDomain: options.sharedDomain,
		rings: options.rings,
		radiusScale: options.radiusScale,
		R
	})

	const radial = lineRadial()
		.angle((p) => p.angleRad)
		.radius((p) => p.radius)
		.defined((p) => p.radius !== null)
		.curve(curveLinearClosed)

	const a = resolveAlpha(alpha, type, chartPreset)

	const fills = []
	const strokes = []

	for (const [seriesKey, vertices] of layout.series) {
		const points = vertices.map((vertex, i) => ({
			angleRad: toRadialAngle(layout.angles[i]),
			radius: vertex ? vertex.radius : null
		}))
		const d = radial(points)

		// One representative row for this series — mirrors the pattern `buildLines` uses for
		// its grouped path — so the shared fill/stroke resolution reads real row data instead
		// of a synthetic aggregate.
		const repRow = vertices.find((vertex) => vertex)?.row ?? {}
		const { fill, stroke } = resolveFillStroke(repRow, channels, colors)

		const patternKey = channels.pattern ? repRow[channels.pattern] : null
		const patternId =
			patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
				? toPatternId(String(patternKey))
				: null

		const keyBase = String(seriesKey)
		fills.push({ d, fill, stroke: 'none', alpha: a, key: `${keyBase}::fill`, patternId })
		strokes.push({ d, fill: 'none', stroke, alpha: 1, key: `${keyBase}::stroke`, patternId: null })
	}

	return [...fills, ...strokes]
}
