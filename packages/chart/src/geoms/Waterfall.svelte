<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildWaterfallMarks } from './lib/marks/waterfall.js'

	type Options = {
		positiveColor?: string
		negativeColor?: string
		totalColor?: string
		totalField?: string
		connectorWidth?: number
	}

	type Props = {
		x?: string
		y?: string
		color?: string
		fill?: string
		/** Fixed bar opacity 0–1; defaults to the per-geom preset (waterfall = 1). */
		alpha?: number
		stat?: string
		options?: Options
	}

	let { x, y, color, fill, alpha, stat = 'identity', options = {} }: Props = $props()

	const colorField = $derived(fill ?? color)
	const connectorWidth = $derived(options.connectorWidth ?? 0.5)
	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'waterfall',
		channels: { x, y, color: colorField },
		stat,
		options,
		alpha,
		build: buildWaterfallMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const bars = $derived(geom.marks)
</script>

{#if bars.length > 0}
	<g data-plot-geom="waterfall">
		{#each bars as bar, i (bar.key)}
			<rect
				x={bar.x}
				y={bar.y}
				width={Math.max(0, bar.width)}
				height={bar.height}
				fill={bar.fill}
				fill-opacity={bar.alpha}
				data-plot-element="waterfall-bar"
				role="img"
				onmouseenter={() => plotState.setHovered(bar.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{bar.data[x ?? '']}: {bar.data[y ?? '']}</title>
			</rect>
			<!-- Connector line to next bar -->
			{#if i < bars.length - 1}
				{@const cs = plotState.place(bar.bandEnd, bar.cumY)}
				{@const ce = plotState.place(bars[i + 1].bandStart, bar.cumY)}
				<line
					x1={cs.x}
					y1={cs.y}
					x2={ce.x}
					y2={ce.y}
					stroke="currentColor"
					stroke-width={connectorWidth}
					stroke-dasharray="3 2"
					opacity="0.5"
					data-plot-element="connector"
				/>
			{/if}
		{/each}
	</g>
{/if}
