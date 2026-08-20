<script lang="ts">
	import Spark from './Spark.svelte'
	import Line from './geoms/Line.svelte'
	import Area from './geoms/Area.svelte'
	import Bar from './geoms/Bar.svelte'
	import Trend from './geoms/Trend.svelte'
	import Highlight from './geoms/Highlight.svelte'
	import { PATTERNS } from './patterns/patterns.js'
	import { resolveHighlight } from './lib/highlight.js'

	type HighlightSelector =
		| 'first'
		| 'last'
		| 'min'
		| 'max'
		| number
		| ((row: { x: number; y: number }, i: number) => boolean)

	type TrendMethod = string | number | { type: string; [k: string]: unknown }

	type Props = {
		data?: number[] | Record<string, unknown>[]
		field?: string
		type?: 'line' | 'area' | 'bar'
		curve?: 'linear' | 'smooth'
		color?: string
		pattern?: keyof typeof PATTERNS
		width?: number
		height?: number
		min?: number
		max?: number
		baseline?: number
		highlight?: HighlightSelector | HighlightSelector[]
		trend?: TrendMethod | TrendMethod[]
	}

	let {
		data = [],
		field = undefined,
		type = 'line',
		curve = 'linear',
		color = 'primary',
		pattern = undefined,
		width = 80,
		height = 24,
		min = undefined,
		max = undefined,
		baseline = undefined,
		highlight = undefined,
		trend = undefined
	}: Props = $props()

	const values = $derived(
		data.map((d) =>
			field && typeof d === 'object' && d !== null ? Number(d[field]) : Number(d)
		)
	)

	const hasNegative = $derived(values.some((v) => v < 0))
	// Bars with negative values are meaningless when measured from the pixel bottom, so a
	// bar sparkline auto-anchors at 0 when any value is negative. Everything else is opt-in.
	const effectiveBaseline = $derived(baseline ?? (type === 'bar' && hasNegative ? 0 : undefined))

	// Adapter to the shared geom pipeline: Spark/SparkState/geoms all read rows keyed by
	// channel name, same as a full Plot — 'x'/'y' here. A geom's `pattern` prop is a
	// data-field CHANNEL, not a literal name, so the literal pattern name is also written onto
	// every row as an ordinary column, and that column name is what's handed to the geom below.
	// `SparkState.patterns` (driven by `Spark`'s own `pattern` prop) maps the same literal name
	// to itself, so both sides resolve `toPatternId(name)` in agreement — no new mechanism.
	const rows = $derived.by(() =>
		values.map((v, i) => (pattern !== undefined ? { x: i, y: v, pattern } : { x: i, y: v }))
	)
	const patternChannel = $derived(pattern !== undefined ? 'pattern' : undefined)

	// The Highlight geom's own `highlight` prop takes exactly ONE selector. Sparkline's contract
	// additionally accepts an array with overlap dedup (e.g. ['last', 3] on a 4-point series
	// name the same point) — resolved here into a single index-predicate, the one selector shape
	// every geom already understands, so Highlight.svelte needs no change.
	const highlightSelectors = $derived(
		Array.isArray(highlight)
			? highlight
			: highlight === null || highlight === undefined
				? []
				: [highlight]
	)
	const highlightIndices = $derived.by(() => {
		const seen = new Set<number>()
		for (const sel of highlightSelectors) {
			for (const i of resolveHighlight(rows, sel, { y: 'y' })) seen.add(i)
		}
		return seen
	})
	const highlightPredicate = $derived(
		highlightIndices.size > 0
			? (_row: Record<string, unknown>, i: number) => highlightIndices.has(i)
			: undefined
	)

	// `color` names a design-token family (e.g. 'primary'), not a data field — resolved to a
	// literal CSS color string once here and handed to each geom's own color/fill channel.
	// `isLiteralColor` (geoms/lib/brewing/colors.js) recognises the rgb(...)/rgba(...) shape and
	// paints it directly on every mark, bypassing the categorical color scale a data-field
	// channel would otherwise be grouped through.
	const strokeColor = $derived(`rgb(var(--color-${color}-500, 100,116,139))`)
	const fillColor = $derived(`rgba(var(--color-${color}-300), 0.25)`)
</script>

<Spark data={rows} x="x" y="y" {width} {height} {min} {max} baseline={effectiveBaseline} {pattern}>
	{#if type === 'line'}
		<Line x="x" y="y" color={strokeColor} options={{ curve, strokeWidth: 1.5 }} />
	{:else if type === 'area'}
		<Area
			x="x"
			y="y"
			fill={fillColor}
			pattern={patternChannel}
			alpha={1}
			options={{ curve, baseline: effectiveBaseline }}
		/>
		<Line x="x" y="y" color={strokeColor} options={{ curve, strokeWidth: 1.5 }} />
	{:else if type === 'bar'}
		<Bar x="x" y="y" fill={strokeColor} pattern={patternChannel} />
	{/if}

	<Trend x="x" y="y" {trend} />
	<Highlight x="x" y="y" highlight={highlightPredicate} />
</Spark>
