<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { SparkState } from './SparkState.svelte.js'
	import DefinePatterns from './patterns/DefinePatterns.svelte'

	type Row = Record<string, unknown>

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		/** Categorical color/series channel — same meaning as a geom's `color`/`fill` prop. */
		color?: string
		width?: number
		height?: number
		min?: number
		max?: number
		/** Anchor value: extends the y-domain to include it AND draws a `[data-plot-baseline]`
		 *  reference line at its pixel. Owned by the container, not a geom — it already owns
		 *  the domain extension, and it applies to bar sparks too, not just area. */
		baseline?: number
		/** Literal pattern name (e.g. 'diagonal') to texture the composed geom's fill with.
		 *  A spark is single-series, so unlike a Plot's pattern CHANNEL (which assigns a
		 *  distinct pattern per distinct field value), there's no grouping to assign — this
		 *  names the one pattern to use directly. See `SparkState.patterns` for the mechanism. */
		pattern?: string
		/** Accessible name for the glyph. Omit and one is generated from the series — see
		 *  `summary` below. Pass a real one whenever the surrounding copy doesn't already
		 *  say what the sparkline is measuring. */
		label?: string
		/** The geom(s) to compose inside — e.g. `<Line />`, `<Area />`, `<Trend />`. */
		children?: Snippet
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		width = 80,
		height = 24,
		min = undefined,
		max = undefined,
		baseline = undefined,
		pattern = undefined,
		label = undefined,
		children
	}: Props = $props()

	// A getter thunk (not a plain object) so every reactive prop it closes over is re-read on
	// each call — used both by the untracked initial construction and the live $effect below.
	const config = () => ({
		data,
		channels: { x, y, color },
		width,
		height,
		min,
		max,
		baseline,
		pattern
	})

	// untrack: the constructor's initial read of config() must not register as a dependency of
	// whatever scope creates <Spark> — mirrors PlotSurface's
	// `untrack(() => new PlotState(fullConfig()))`. The $effect below is the sole mechanism
	// that keeps the state live.
	const state = untrack(() => new SparkState(config()))

	// SAME context key PlotState publishes on — this is what lets a geom compose inside a
	// Spark with zero changes: it never knows, or branches on, which container it resolved.
	setContext('plot-state', state)

	// Keeps props live: SparkState.update() is designed to be re-callable (see its doc
	// comment) and fully re-applies config rather than merging deltas, so every prop change
	// here — including ones read only inside a composed geom's channels — flows through.
	$effect(() => {
		state.update(config())
	})

	/** Round for speech: drops a pointless `.00` without truncating real precision. */
	function speak(n: number) {
		return String(Math.round(n * 100) / 100)
	}

	// A sparkline carries meaning purely visually, so without this it is not merely
	// unlabelled — it is unreadable to a screen reader. Cycle 1 shipped every spark as a
	// bare <svg> with no role or name at all.
	//
	// Generated from the series rather than a fixed "sparkline" string: a constant would
	// satisfy an axe rule while still telling the user nothing. Count, direction, endpoints
	// and extent are what someone reads off the shape visually, so they are what the text
	// alternative says.
	const summary = $derived.by(() => {
		const values = y ? data.map((row) => Number(row[y])).filter((v) => Number.isFinite(v)) : []
		if (!values.length) return 'Sparkline with no data'

		const first = values[0]
		const last = values[values.length - 1]
		// reduce rather than Math.min(...values): spread on a long series risks a stack
		// overflow, and a spark is free to be handed thousands of points.
		const lo = values.reduce((a, b) => (b < a ? b : a), first)
		const hi = values.reduce((a, b) => (b > a ? b : a), first)
		const direction = last > first ? 'rising' : last < first ? 'falling' : 'flat'

		return (
			`Sparkline: ${values.length} values, ${direction} from ${speak(first)} to ` +
			`${speak(last)}, ranging ${speak(lo)} to ${speak(hi)}.`
		)
	})

	const accessibleName = $derived(label ?? summary)

	// The baseline line is the container's concern, not a geom's: it already owns the domain
	// extension (SparkState's y-domain widening), and it applies to bar sparks too, not just
	// area — so a single reference line lives here rather than duplicated inside every geom.
	const baselineY = $derived.by(() => {
		if (baseline === undefined) return null
		const scale = state.yScale
		// buildUnifiedYScale's return type is a union (linear | band) because a PlotState y
		// channel *can* be categorical — a spark's never is (SparkState's #yDomain is always
		// numeric), so this is always the linear branch in practice. `'ticks' in scale` narrows
		// the union for the compiler without a bare property access on a member (ScaleBand)
		// that doesn't have it at all (same union Plot/Grid.svelte narrows for xScale/yScale).
		return 'ticks' in scale ? scale(baseline) : null
	})
</script>

<svg
	{width}
	{height}
	data-spark
	role="img"
	aria-label={accessibleName}
	style="overflow: visible; display: block;"
>
	<!-- role="img" + aria-label is what actually gets announced; title/desc are the
	     SVG-native equivalents, kept for tooling and non-ARIA consumers. `desc` always
	     holds the generated data summary even when `label` overrides the name, so the
	     numbers stay available rather than being replaced by the caller's wording. -->
	<title>{accessibleName}</title>
	<desc>{summary}</desc>

	<!-- SVG <pattern> defs for texture fills — the same mechanism PlotSurface wires up, so a
	     geom's pattern channel resolves inside a Spark exactly as it does inside a Plot. -->
	<defs>
		<DefinePatterns />
	</defs>

	{#if baselineY !== null}
		<line x1={0} y1={baselineY} x2={width} y2={baselineY} data-plot-baseline />
	{/if}

	{@render children?.()}
</svg>

<style>
	[data-plot-baseline] {
		stroke: var(--chart-baseline-color, currentColor);
		stroke-width: var(--chart-baseline-width, 1);
		stroke-dasharray: var(--chart-baseline-dash, 4 4);
		opacity: var(--chart-baseline-opacity, 0.5);
		pointer-events: none;
	}
</style>
