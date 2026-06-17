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
		max = undefined
	}: Props = $props()

	const values = $derived(
		data.map((d) =>
			field && typeof d === 'object' && d !== null ? Number(d[field]) : Number(d)
		)
	)

	const yMin = $derived(min ?? Math.min(...values))
	const yMax = $derived(max ?? Math.max(...values))

	const xScale = $derived(
		scaleLinear()
			.domain([0, values.length - 1])
			.range([0, width])
	)
	const yScale = $derived(scaleLinear().domain([yMin, yMax]).range([height, 0]))

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
			<rect
				x={xScale(i) - barWidth / 2}
				y={yScale(v)}
				width={barWidth}
				height={height - yScale(v)}
				fill={strokeColor}
			/>
			{#if patternMarks}
				<rect
					x={xScale(i) - barWidth / 2}
					y={yScale(v)}
					width={barWidth}
					height={height - yScale(v)}
					fill="url(#{patternId})"
					pointer-events="none"
				/>
			{/if}
		{/each}
	{/if}
</svg>
