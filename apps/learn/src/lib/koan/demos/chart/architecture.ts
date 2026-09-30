/**
 * The LOAD layer for the chart explorer's Architecture recipes — real metrics measured from
 * THIS repo by `apps/learn/scripts/build-architecture-metrics.mjs`, not invented numbers.
 *
 * The recipes are compositions of generic `@rokkit/chart` primitives (`Region`, `Rule` with a
 * slope, `Hull`, `Contour`, `Point`). Nothing here is chart-package vocabulary: the zones, the
 * thresholds and what they mean belong to the analysis, so they live with the demo.
 */
import data from './architecture.json'

/** One Martin component: a top-level folder under a package's `src/`, or the package root. */
export type ComponentMetrics = {
	component: string
	package: string
	files: number
	loc: number
	churn: number
	/** Afferent coupling — files outside that import something inside. */
	ca: number
	/** Efferent coupling — files inside that import something outside. */
	ce: number
	/** I = Ce / (Ca + Ce): 0 is maximally stable, 1 maximally unstable. */
	instability: number
	/** A = abstract declarations / all declarations. */
	abstractness: number
	/** D = |A + I − 1| — distance from the main sequence. */
	distance: number
}

export type ModuleMetrics = {
	id: string
	label: string
	package: string
	component: string
	loc: number
	/** Decision points + 1 — approximate cyclomatic complexity. */
	complexity: number
	/** Commits that touched the file. */
	churn: number
	/** Statement coverage 0..1, or null for a file with no executable statements. */
	coverage: number | null
	declarations: number
	abstract: number
	fanIn: number
	fanOut: number
}

export const components = data.components as ComponentMetrics[]
export const modules = data.modules as ModuleMetrics[]
/** Modules with a coverage figure — a file with no statements has nothing to cover. */
export const covered = modules.filter((m) => m.coverage !== null) as Array<
	ModuleMetrics & { coverage: number }
>

/** Linear-interpolated quantile, `q` in 0..1. 0 for an empty list. */
export function quantile(values: number[], q: number): number {
	if (values.length === 0) return 0
	const sorted = [...values].sort((a, b) => a - b)
	const pos = (sorted.length - 1) * q
	const lo = Math.floor(pos)
	const hi = Math.ceil(pos)
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

type Vertex = [number, number]

/**
 * Martin's two zones as polygons on the (I, A) plane, for `Plot.Region points`.
 *
 * A component is in a zone when its distance from the main sequence is at least `t` AND it
 * sits on that zone's side of the line: below it (A + I < 1 − t) is the zone of PAIN —
 * concrete and heavily depended upon, so every change ripples; above it (A + I > 1 + t) is
 * the zone of USELESSNESS — abstract and depended upon by nothing.
 */
export function mainSequenceZones(t = 0.5): { pain: Vertex[]; uselessness: Vertex[] } {
	return {
		pain: [
			[0, 0],
			[1 - t, 0],
			[0, 1 - t]
		],
		uselessness: [
			[1, 1],
			[t, 1],
			[1, t]
		]
	}
}

/** The share of modules past a threshold is 1 − this. */
export const THRESHOLD_QUANTILE = 0.95

/**
 * The 95th percentile of each module metric — the edge of the "far corner" every recipe
 * shades. Percentiles rather than absolute numbers because what counts as complex is relative
 * to the codebase: a fixed cut-off is right for one repo and meaningless for the next.
 *
 * 95th, not 90th: these metrics are heavy-tailed. rokkit's median module has one import in and
 * one out, so its p90 fan-in is 3 — and a region starting at 3 covers nearly the whole plot,
 * marking the ordinary as extreme. p95 leaves about thirty modules past each line.
 */
export const thresholds = {
	complexity: quantile(
		modules.map((m) => m.complexity),
		THRESHOLD_QUANTILE
	),
	churn: quantile(
		modules.map((m) => m.churn),
		THRESHOLD_QUANTILE
	),
	fanIn: quantile(
		modules.map((m) => m.fanIn),
		THRESHOLD_QUANTILE
	),
	fanOut: quantile(
		modules.map((m) => m.fanOut),
		THRESHOLD_QUANTILE
	)
}
