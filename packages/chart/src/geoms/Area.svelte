<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildAreaMarks } from './lib/marks/area.js'
	import { buildSelectDetail } from '../lib/select.js'

	type Row = Record<string, unknown>
	type Options = {
		/** @deprecated use `position="stack"` — kept as an alias. */
		stack?: boolean
		curve?: 'linear' | 'smooth' | 'step'
	}

	type Props = {
		x?: string
		y?: string
		/** Border aesthetic (field); a border is drawn only when both fill and color are set. */
		color?: string
		/** Interior aesthetic (field); falls back to `color`. */
		fill?: string
		pattern?: string
		/** Multi-series arrangement: 'stack' | 'fill' (100%) | 'identity' (overlap, default). */
		position?: 'stack' | 'fill' | 'identity'
		/** Fixed area opacity 0–1; defaults to the per-geom preset (area = 0.6). */
		alpha?: number
		stat?: string
		options?: Options
	}

	let { x, y, color, fill, pattern, position, alpha, stat = 'identity', options = {} }: Props =
		$props()

	// `options.stack: true` is the back-compat alias for position='stack'.
	const resolvedPosition = $derived(position ?? (options?.stack ? 'stack' : 'identity'))

	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'area',
		channels: { x, y, color, fill, pattern },
		stat,
		options: { stack: options?.stack ?? false, position: resolvedPosition, curve: options?.curve },
		alpha,
		build: buildAreaMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const areas = $derived(geom.marks)
	// Per-row tooltip hit-circles are rendered from the geom's rows + shared scales.
	const rows = $derived(geom.data)
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)

	const seriesField = $derived(fill ?? color)

	function selectPoint(d: Row, event: MouseEvent | KeyboardEvent) {
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail(
					d,
					plotState.data.indexOf(d),
					{ x, y },
					'area',
					seriesField ? d[seriesField] : undefined,
					event
				)
			)
	}
</script>

{#if areas.length > 0}
	<g data-plot-geom="area">
		{#each areas as seg (seg.key ?? seg.d)}
			<path
				d={seg.d}
				fill={seg.fill}
				fill-opacity={seg.patternId ? 1 : seg.alpha}
				stroke={seg.stroke ?? 'none'}
				data-plot-element="area"
			/>
			{#if seg.patternId}
				<path d={seg.d} fill="url(#{seg.patternId})" data-plot-element="area" />
			{/if}
		{/each}
		<!-- Invisible hit circles for tooltip: one per data point -->
		{#if x && y}
			{#each rows as d, i (`hover::${i}`)}
				{@const px = typeof xScale?.bandwidth === 'function' ? (xScale(d[x]) ?? 0) + xScale.bandwidth() / 2 : (xScale?.(d[x]) ?? 0)}
				{@const py = yScale?.(d[y]) ?? 0}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<circle
					cx={px}
					cy={py}
					r="8"
					fill="transparent"
					stroke="none"
					role={plotState.interactive ? 'button' : 'presentation'}
					tabindex={plotState.interactive ? 0 : undefined}
					style:cursor={plotState.interactive ? 'pointer' : undefined}
					data-plot-element="area-hover"
					onmouseenter={() => plotState.setHovered(d)}
					onmouseleave={() => plotState.clearHovered()}
					onclick={plotState.interactive ? (e) => selectPoint(d, e) : undefined}
					onkeydown={plotState.interactive
						? (e) => (e.key === 'Enter' || e.key === ' ') && selectPoint(d, e)
						: undefined}
				/>
			{/each}
		{/if}
	</g>
{/if}
