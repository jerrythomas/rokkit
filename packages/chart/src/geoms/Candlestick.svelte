<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildCandleMarks } from './lib/marks/candlestick.js'

	type Options = {
		open?: string
		high?: string
		low?: string
		close?: string
		upColor?: string
		downColor?: string
		wickWidth?: number
	}

	type Props = {
		x?: string
		y?: string
		color?: string
		fill?: string
		/** Fixed opacity 0–1; defaults to the per-geom preset (candlestick = 1). */
		alpha?: number
		stat?: string
		options?: Options
	}

	let { x, y: _y = undefined, color, fill, alpha, stat = 'identity', options = {} }: Props = $props()

	const colorField = $derived(fill ?? color)
	const high = $derived(options.high ?? 'high')
	const wickWidth = $derived(options.wickWidth ?? 1)
	const plotState = getContext<PlotState>('plot-state')

	// Register with y pointing to 'high' so the y scale covers the full range.
	const geom = new GeomState(plotState, () => ({
		type: 'candlestick',
		channels: { x, y: high, color: colorField },
		stat,
		options,
		alpha,
		build: buildCandleMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const candles = $derived(geom.marks)
</script>

{#if candles.length > 0}
	<g data-plot-geom="candlestick">
		{#each candles as c (c.key)}
			<!-- Wick (high to low) -->
			<line
				x1={c.wickX1}
				y1={c.wickY1}
				x2={c.wickX2}
				y2={c.wickY2}
				stroke={c.fill}
				stroke-opacity={c.alpha}
				stroke-width={wickWidth}
				data-plot-element="wick"
			/>
			<!-- Body (open to close) -->
			<rect
				x={c.bodyX}
				y={c.bodyY}
				width={c.bodyWidth}
				height={c.bodyHeight}
				fill={c.fill}
				fill-opacity={c.alpha}
				data-plot-element="candle"
				role="img"
				onmouseenter={() => plotState.setHovered(c.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{c.data[x ?? '']}: O={c.data[options.open ?? 'open']} H={c.data[options.high ?? 'high']} L={c.data[options.low ?? 'low']} C={c.data[options.close ?? 'close']}</title>
			</rect>
		{/each}
	</g>
{/if}
