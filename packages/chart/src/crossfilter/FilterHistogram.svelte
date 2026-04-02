<script>
	// @ts-nocheck
	import { getContext } from 'svelte'
	import { bin, extent, max } from 'd3-array'
	import { scaleLinear } from 'd3-scale'
	import { format } from 'd3-format'

	/**
	 * Interactive histogram with brush selection for crossfilter range dimensions.
	 * Renders bins as bars; mouse drag selects a range and calls cf.setRange().
	 * Click without dragging clears the filter.
	 */
	let {
		data = [],
		field = '',
		label = '',
		bins: binCount = 20,
		width = 280,
		height = 120,
		color = 'var(--color-primary, steelblue)',
		dimColor = 'var(--color-surface-z3, #ccc)'
	} = $props()

	const cf = getContext('crossfilter')

	const margin = { top: 8, right: 10, bottom: 22, left: 32 }

	const innerWidth = $derived(width - margin.left - margin.right)
	const innerHeight = $derived(height - margin.top - margin.bottom)

	// Compute histogram bins from data
	const binner = $derived(
		bin()
			.value((d) => d[field])
			.thresholds(binCount)
	)
	const binned = $derived(data.length > 0 ? binner(data) : [])
	const domainExtent = $derived(data.length > 0 ? extent(data, (d) => d[field]) : [0, 1])

	// Scales
	const xScale = $derived(
		scaleLinear()
			.domain(domainExtent)
			.range([0, innerWidth])
			.nice()
	)
	const yScale = $derived(
		binned.length > 0
			? scaleLinear()
					.domain([0, max(binned, (d) => d.length) ?? 1])
					.range([innerHeight, 0])
					.nice()
			: scaleLinear().domain([0, 1]).range([innerHeight, 0])
	)

	// Active range from crossfilter
	const activeRange = $derived(cf?.filters?.get(field))

	// Brush state
	let brushStartPx = $state(null)
	let brushEndPx = $state(null)
	let brushing = $state(false)

	// Brush rect in pixel space
	const brushRect = $derived.by(() => {
		// Show committed range if not currently brushing
		if (brushStartPx === null && activeRange) {
			const [lo, hi] = activeRange
			return {
				x: xScale(lo),
				width: Math.max(1, xScale(hi) - xScale(lo))
			}
		}
		if (brushStartPx === null) return null
		const lo = Math.min(brushStartPx, brushEndPx ?? brushStartPx)
		const hi = Math.max(brushStartPx, brushEndPx ?? brushStartPx)
		return { x: lo, width: Math.max(1, hi - lo) }
	})

	function pixelToValue(px) {
		return xScale.invert(Math.max(0, Math.min(innerWidth, px)))
	}

	function getLocalX(e) {
		const svgEl = e.currentTarget.closest('svg')
		const rect = svgEl.getBoundingClientRect()
		return e.clientX - rect.left - margin.left
	}

	function onMouseDown(e) {
		brushStartPx = getLocalX(e)
		brushEndPx = brushStartPx
		brushing = true
	}

	function onMouseMove(e) {
		if (!brushing) return
		brushEndPx = getLocalX(e)
	}

	function onMouseUp() {
		if (!brushing) return
		brushing = false
		const lo = Math.min(brushStartPx, brushEndPx)
		const hi = Math.max(brushStartPx, brushEndPx)
		if (hi - lo < 3) {
			// Treat as click — clear filter
			cf?.clearFilter(field)
			brushStartPx = null
			brushEndPx = null
			return
		}
		const loVal = pixelToValue(lo)
		const hiVal = pixelToValue(hi)
		cf?.setRange(field, [loVal, hiVal])
		brushStartPx = null
		brushEndPx = null
	}

	// Check if a bin is within active range
	function binInRange(b) {
		if (!activeRange) return true
		const [lo, hi] = activeRange
		return b.x1 > lo && b.x0 < hi
	}

	// Y-axis tick values (2-3 ticks)
	const yTicks = $derived(yScale.ticks(3))
	// X-axis tick values (4 ticks)
	const xTicks = $derived(xScale.ticks(4))

	const fmt = format('.2~s')
</script>

<div data-filter-histogram data-filter-field={field} style="width:{width}px">
	{#if label}
		<div data-filter-histogram-label>{label}</div>
	{/if}
	<svg
		{width}
		{height}
		style="display:block;cursor:crosshair;user-select:none"
		role="img"
		aria-label="Histogram filter for {label || field}"
		onmousedown={onMouseDown}
		onmousemove={onMouseMove}
		onmouseup={onMouseUp}
		onmouseleave={onMouseUp}
	>
		<g transform="translate({margin.left},{margin.top})">
			<!-- Y axis ticks -->
			{#each yTicks as tick}
				<line
					x1={0}
					x2={innerWidth}
					y1={yScale(tick)}
					y2={yScale(tick)}
					stroke="currentColor"
					stroke-opacity="0.1"
					stroke-width="1"
				/>
				<text
					x={-4}
					y={yScale(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					font-size="9"
					fill="currentColor"
					opacity="0.5">{tick}</text
				>
			{/each}

			<!-- X axis line -->
			<line
				x1={0}
				x2={innerWidth}
				y1={innerHeight}
				y2={innerHeight}
				stroke="currentColor"
				stroke-opacity="0.2"
			/>

			<!-- X axis ticks -->
			{#each xTicks as tick}
				<text
					x={xScale(tick)}
					y={innerHeight + 12}
					text-anchor="middle"
					font-size="9"
					fill="currentColor"
					opacity="0.5">{fmt(tick)}</text
				>
			{/each}

			<!-- Bars -->
			{#each binned as b}
				{@const bx = xScale(b.x0) + 1}
				{@const bw = Math.max(0, xScale(b.x1) - xScale(b.x0) - 1)}
				{@const by = yScale(b.length)}
				{@const bh = innerHeight - by}
				<rect
					x={bx}
					y={by}
					width={bw}
					height={bh}
					fill={activeRange ? (binInRange(b) ? color : dimColor) : color}
					opacity="0.85"
					data-filter-histogram-bar
				/>
			{/each}

			<!-- Brush overlay rect -->
			{#if brushRect}
				<rect
					x={brushRect.x}
					y={0}
					width={brushRect.width}
					height={innerHeight}
					fill={color}
					opacity="0.15"
					pointer-events="none"
				/>
				<rect
					x={brushRect.x}
					y={0}
					width={1}
					height={innerHeight}
					fill={color}
					opacity="0.6"
					pointer-events="none"
				/>
				<rect
					x={brushRect.x + brushRect.width - 1}
					y={0}
					width={1}
					height={innerHeight}
					fill={color}
					opacity="0.6"
					pointer-events="none"
				/>
			{/if}
		</g>
	</svg>
	{#if activeRange}
		<div data-filter-histogram-range>
			{fmt(activeRange[0])} – {fmt(activeRange[1])}
			<button
				data-filter-histogram-clear
				onclick={() => cf?.clearFilter(field)}
				aria-label="Clear {label || field} filter"
			>✕</button>
		</div>
	{/if}
</div>

<style>
	[data-filter-histogram] {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
	}
	[data-filter-histogram-label] {
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}
	[data-filter-histogram-range] {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		opacity: 0.8;
	}
	[data-filter-histogram-clear] {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 2px;
		font-size: 10px;
		opacity: 0.6;
		line-height: 1;
	}
	[data-filter-histogram-clear]:hover {
		opacity: 1;
	}
</style>
