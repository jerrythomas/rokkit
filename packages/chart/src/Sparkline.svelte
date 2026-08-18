<script lang="ts">
	import { scaleLinear } from 'd3-scale'
	import { line as d3line, area as d3area, curveCatmullRom } from 'd3-shape'
	import PatternDef from './patterns/PatternDef.svelte'
	import { PATTERNS } from './patterns/patterns.js'
	import { resolveHighlight } from './lib/highlight.js'
	import { computeTrend } from './lib/trend.js'

	type HighlightSelector =
		| 'first'
		| 'last'
		| 'min'
		| 'max'
		| number
		| ((row: { x: number; y: number }, i: number) => boolean)

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
		trend?:
			| string
			| number
			| { type: string; [k: string]: unknown }
			| Array<string | number | { type: string; [k: string]: unknown }>
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

	// Adapter to the pure geom utilities (they operate on {x,y} rows).
	const rows = $derived(values.map((v, i) => ({ x: i, y: v })))

	const hasNegative = $derived(values.some((v) => v < 0))
	// Bars with negative values are meaningless when measured from the pixel bottom, so a
	// bar sparkline auto-anchors at 0 when any value is negative. Everything else is opt-in.
	const effectiveBaseline = $derived(baseline ?? (type === 'bar' && hasNegative ? 0 : undefined))

	const rawMin = $derived(Math.min(...values))
	const rawMax = $derived(Math.max(...values))
	// Explicit min/max win; otherwise extend the auto domain to include the baseline so it
	// (and the full negative extent) stay on-canvas.
	const yMin = $derived(
		min ?? (effectiveBaseline !== undefined ? Math.min(rawMin, effectiveBaseline) : rawMin)
	)
	const yMax = $derived(
		max ?? (effectiveBaseline !== undefined ? Math.max(rawMax, effectiveBaseline) : rawMax)
	)

	const xScale = $derived(
		scaleLinear()
			.domain([0, values.length - 1])
			.range([0, width])
	)
	const yScale = $derived(scaleLinear().domain([yMin, yMax]).range([height, 0]))

	// When no baseline is in effect, anchor at the pixel bottom — preserves the classic
	// min-anchored sparkbar look (Math.min/abs below both collapse to the old formula).
	const barAnchorY = $derived(effectiveBaseline !== undefined ? yScale(effectiveBaseline) : height)

	const highlightSelectors = $derived(
		Array.isArray(highlight)
			? highlight
			: highlight === null || highlight === undefined
				? []
				: [highlight]
	)
	const highlightIndices = $derived.by(() => {
		const seen = new Set()
		for (const sel of highlightSelectors) {
			for (const i of resolveHighlight(rows, sel, { y: 'y' })) seen.add(i)
		}
		return [...seen]
	})
	const highlightMarks = $derived(
		highlightIndices
			.map((i) => ({ i, cx: xScale(i), cy: yScale(values[i]) }))
			.filter((m) => Number.isFinite(m.cx) && Number.isFinite(m.cy))
	)

	const trendMethods = $derived(
		Array.isArray(trend) ? trend : trend === null || trend === undefined ? [] : [trend]
	)
	const trendPaths = $derived.by(() => {
		const out = []
		trendMethods.forEach((m, idx) => {
			const res = computeTrend(rows, { x: 'x', y: 'y' }, m)
			if (!res) return
			if (res.kind === 'constant') {
				const yy = yScale(res.value)
				out.push({ d: `M0,${yy} L${width},${yy}`, i: idx })
			} else {
				const gen = d3line()
					.x((_, i) => xScale(i))
					.y((v) => yScale(v))
				const d = gen(res.values)
				if (d) out.push({ d, i: idx })
			}
		})
		return out
	})

	const linePath = $derived.by(() => {
		const gen = d3line<number>()
			.x((_, i) => xScale(i))
			.y((v) => yScale(v))
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		return gen(values)
	})

	const areaPath = $derived.by(() => {
		const gen = d3area<number>()
			.x((_, i) => xScale(i))
			.y0(height)
			.y1((v) => yScale(v))
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		return gen(values)
	})

	const barWidth = $derived(Math.max(1, width / values.length - 1))

	const strokeColor = $derived(`rgb(var(--color-${color}-500, 100,116,139))`)
	const fillColor = $derived(`rgba(var(--color-${color}-300), 0.25)`)

	const patternId = 'sparkline-pattern'
	const patternMarks = $derived(pattern ? (PATTERNS[pattern] ?? null) : null)
</script>

<svg {width} {height} style="overflow: visible; display: block;">
	{#if patternMarks}
		<defs>
			<PatternDef id={patternId} marks={patternMarks} stroke={strokeColor} />
		</defs>
	{/if}

	{#if type === 'line'}
		<path
			d={linePath}
			fill="none"
			stroke={strokeColor}
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	{:else if type === 'area'}
		<path d={areaPath} fill={patternMarks ? `url(#${patternId})` : fillColor} stroke="none" />
		<path
			d={linePath}
			fill="none"
			stroke={strokeColor}
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	{:else if type === 'bar'}
		{#each values as v, i (i)}
			{@const vy = yScale(v)}
			{@const top = Math.min(vy, barAnchorY)}
			{@const barHeight = Math.abs(vy - barAnchorY)}
			<rect
				x={xScale(i) - barWidth / 2}
				y={top}
				width={barWidth}
				height={barHeight}
				fill={strokeColor}
			/>
			{#if patternMarks}
				<rect
					x={xScale(i) - barWidth / 2}
					y={top}
					width={barWidth}
					height={barHeight}
					fill="url(#{patternId})"
					pointer-events="none"
				/>
			{/if}
		{/each}
	{/if}

	{#if trendPaths.length}
		<g data-plot-geom="trend">
			{#each trendPaths as p (p.i)}
				<path d={p.d} data-plot-trend fill="none" />
			{/each}
		</g>
	{/if}

	{#if effectiveBaseline !== undefined}
		<line x1={0} y1={barAnchorY} x2={width} y2={barAnchorY} data-plot-baseline />
	{/if}

	{#if highlightMarks.length}
		<g data-plot-geom="highlight">
			{#each highlightMarks as m (m.i)}
				<circle cx={m.cx} cy={m.cy} data-plot-highlight />
			{/each}
		</g>
	{/if}
</svg>

<style>
	[data-plot-baseline] {
		stroke: var(--chart-baseline-color, currentColor);
		stroke-width: var(--chart-baseline-width, 1);
		stroke-dasharray: var(--chart-baseline-dash, 4 4);
		opacity: var(--chart-baseline-opacity, 0.5);
		pointer-events: none;
	}

	[data-plot-highlight] {
		fill: var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)));
		stroke: var(--chart-highlight-ring, none);
		r: var(--chart-highlight-radius, 3);
		pointer-events: none;
	}

	[data-plot-trend] {
		fill: none;
		stroke: var(--chart-trend-color, currentColor);
		stroke-width: var(--chart-trend-width, 1);
		stroke-dasharray: var(--chart-trend-dash, 4 4);
		opacity: var(--chart-trend-opacity, 0.7);
		pointer-events: none;
	}
</style>
