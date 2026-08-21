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
export const LABEL_MARGIN = 32

/**
 * Smallest outer radius at which the full form is actually usable: 24px is the minimum
 * reachable hit target, and a vertex sits ON the outer radius, so below this the chrome
 * is unreadable and the targets unreachable.
 */
export const MIN_PLOT_RADIUS = 24

/**
 * Below this extent (the smaller of width/height) there is no room for BOTH the label
 * margin and a usable plot radius, so radar drops to its micro form.
 */
export const MICRO_THRESHOLD = 2 * (LABEL_MARGIN + MIN_PLOT_RADIUS)

/** Legible axis-count range for the micro form — see the warn in `buildRadarMarks`. */
export const MICRO_MIN_AXES = 3
export const MICRO_MAX_AXES = 5

/**
 * The one definition of radar's outer radius and which form it is drawing.
 *
 * Both `Radar.svelte` (grid, spokes, labels, vertices) and `buildRadarMarks` (the
 * polygons) need this, and they used to derive it separately from the same
 * `innerWidth`/`innerHeight` — two copies of one rule, free to drift apart. A test had to
 * pin the outermost grid ring to the polygon's own radius to catch that drift; this
 * removes the possibility instead of policing it.
 *
 * The micro form draws no labels, so it spends the whole half-extent on the polygon.
 * Reserving the label margin there is what collapsed it: a Spark is 80×24, so the
 * half-extent is 12px against a 32px margin, giving R = 0 and an invisible glyph.
 *
 * @param {number} innerWidth
 * @param {number} innerHeight
 * @returns {{ R: number, micro: boolean }}
 */
export function resolveRadarRadius(innerWidth, innerHeight) {
	const extent = Math.min(innerWidth, innerHeight)
	const micro = extent < MICRO_THRESHOLD
	const half = extent / 2
	return { R: Math.max(0, micro ? half : half - LABEL_MARGIN), micro }
}

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

	const { R, micro } = resolveRadarRadius(innerWidth, innerHeight)

	const layout = buildRadarLayout(data, channels, {
		axes: options.axes,
		sharedDomain: options.sharedDomain,
		rings: options.rings,
		radiusScale: options.radiusScale,
		R
	})

	// The micro form is read as a gestalt shape, not measured: below 3 axes there is no area
	// to perceive, and above 5 at glyph size the spokes collapse into an unreadable star.
	// Warned rather than clamped — silently dropping a caller's axis would change what the
	// glyph asserts about the data. Lives here, alongside polar.js's own dev warns, rather
	// than in Radar.svelte, so the component stays render-only.
	if (micro && (layout.axes.length < MICRO_MIN_AXES || layout.axes.length > MICRO_MAX_AXES))
		// eslint-disable-next-line no-console
		console.warn(
			`[Radar] ${layout.axes.length} axes in a micro (Spark-sized) radar — ` +
				`${MICRO_MIN_AXES}–${MICRO_MAX_AXES} is the legible range at glyph size. ` +
				'The shape is meant to be read at a glance, not measured.'
		)

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
