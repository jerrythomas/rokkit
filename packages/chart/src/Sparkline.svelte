<script lang="ts">
	import { scaleLinear } from 'd3-scale'
	import { line as d3line, area as d3area, curveCatmullRom } from 'd3-shape'
	import PatternDef from './patterns/PatternDef.svelte'
	import { PATTERNS } from './patterns/patterns.js'

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
		baseline = undefined
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

	{#if effectiveBaseline !== undefined}
		<line x1={0} y1={barAnchorY} x2={width} y2={barAnchorY} data-plot-baseline />
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
</style>
