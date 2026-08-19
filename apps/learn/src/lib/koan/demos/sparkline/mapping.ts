// Pure UI-settings → Sparkline-prop mapping. Kept framework-free (no runes) so
// the tricky conversions are unit-testable in isolation.
//
// Why this exists: the shipped Sparkline has no 'minmax'/'all' highlight tokens
// and `baseline` is strictly a number — passing the raw UI values would either
// render zero markers or draw a spurious zero-line. This module is the single
// place those UI vocabularies are translated to what the component accepts.

export type SparkType = 'line' | 'bar' | 'area'
export type HighlightMode = 'none' | 'minmax' | 'last' | 'all'
export type TrendMode = 'none' | 'avg' | 'linear'

/** The UI-facing settings the controls read/write. */
export type SparklineSettings = {
	type: SparkType
	baseline: boolean
	highlight: HighlightMode
	trend: TrendMode
}

/** The subset of real <Sparkline> props the demo drives. */
export type SparklineProps = {
	type: SparkType
	baseline: number | undefined
	highlight: Array<'min' | 'max' | 'last'> | undefined
	trend: 'avg' | 'linear' | undefined
}

const HIGHLIGHT_TOKENS: Record<HighlightMode, Array<'min' | 'max' | 'last'> | undefined> = {
	none: undefined,
	minmax: ['min', 'max'],
	last: ['last'],
	all: ['min', 'max', 'last']
}

export function toSparklineProps(s: SparklineSettings): SparklineProps {
	return {
		type: s.type,
		// baseline OFF must be undefined — `false` is not nullish, so the
		// component would still draw a rule at yScale(0).
		baseline: s.baseline ? 0 : undefined,
		highlight: HIGHLIGHT_TOKENS[s.highlight],
		trend: s.trend === 'none' ? undefined : s.trend
	}
}
