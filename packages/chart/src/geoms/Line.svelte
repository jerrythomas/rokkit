<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildLineMarks } from './lib/marks/line.js'
	import { resolveLabel } from './lib/aesthetics.js'
	import { buildSymbolPath } from '../lib/brewing/marks/points.js'
	import { keyboardNav } from '../lib/keyboard-nav.js'
	import { buildSelectDetail } from '../lib/select.js'
	import LabelPill from './LabelPill.svelte'

	type Row = Record<string, unknown>
	type Options = {
		curve?: 'linear' | 'smooth' | 'step'
		strokeWidth?: number
		markerRadius?: number
		labelOffset?: { x?: number; y?: number }
	}

	type Props = {
		x?: string
		y?: string
		/** Line/stroke aesthetic (field). */
		color?: string
		/** Accepted as an alias for `color` (a line has no interior). */
		fill?: string
		symbol?: string
		/** Fixed line opacity 0–1; defaults to the per-geom preset (line = 1). */
		alpha?: number
		label?: boolean | string | ((data: Row) => unknown)
		stat?: string
		options?: Options
		onselect?: (data: Row) => void
		keyboard?: boolean
	}

	let {
		x,
		y,
		color,
		fill,
		symbol: symbolField,
		alpha,
		label = false,
		stat = 'identity',
		options = {},
		onselect = undefined,
		keyboard = false
	}: Props = $props()

	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'line',
		channels: { x, y, color, fill, symbol: symbolField },
		stat,
		options,
		alpha,
		build: buildLineMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const lines = $derived(geom.marks)
	// Markers are a rendering detail resolved from the shared symbol scale.
	const symbolMap = $derived(plotState.symbols)
	const markerRadius = $derived(options.markerRadius ?? 4)

	function selectPoint(
		pt: { data: Row },
		seg: { key?: unknown },
		event: MouseEvent | KeyboardEvent
	) {
		onselect?.(pt.data)
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail({
					datum: pt.data,
					index: plotState.data.indexOf(pt.data),
					channels: { x, y },
					geom: 'line',
					series: seg?.key,
					event
				})
			)
	}
</script>

{#if lines.length > 0}
	<g data-plot-geom="line">
		{#each lines as seg (seg.key ?? seg.d)}
			<path
				d={seg.d}
				fill="none"
				stroke={seg.stroke}
				stroke-width={options.strokeWidth ?? 2}
				stroke-linejoin="round"
				stroke-linecap="round"
				stroke-opacity={seg.alpha}
				data-plot-element="line"
			/>
			{#if symbolField && symbolMap}
				{#each seg.points as pt (pt.i)}
					<path
						transform="translate({pt.x},{pt.y})"
						d={buildSymbolPath(symbolMap.get(pt.data[symbolField]) ?? 'circle', markerRadius)}
						fill={seg.stroke}
						stroke={seg.stroke}
						stroke-width="1"
						data-plot-element="line-marker"
					/>
				{/each}
			{/if}
			{#if label}
				{#each seg.points as pt (`label::${pt.i}`)}
					{@const text = resolveLabel(label, pt.data, y)}
					{#if text}
						<LabelPill
							x={pt.x + (options.labelOffset?.x ?? 0)}
							y={pt.y + (options.labelOffset?.y ?? -12)}
							{text}
							color={seg.stroke ?? '#333'}
						/>
					{/if}
				{/each}
			{/if}
			<!-- Invisible hit areas for tooltip and selection -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			{#each seg.points as pt (`hover::${pt.i}`)}
				<circle
					cx={pt.x}
					cy={pt.y}
					r="8"
					fill="transparent"
					stroke="none"
					role={onselect || keyboard || plotState.interactive ? 'button' : 'presentation'}
					tabindex={onselect || keyboard || plotState.interactive ? 0 : undefined}
					style:cursor={onselect || keyboard || plotState.interactive ? 'pointer' : undefined}
					data-plot-element="line-hover"
					onmouseenter={() => plotState.setHovered(pt.data)}
					onmouseleave={() => plotState.clearHovered()}
					onclick={onselect || keyboard || plotState.interactive
						? (e) => selectPoint(pt, seg, e)
						: undefined}
					onkeydown={onselect || keyboard || plotState.interactive
						? (e) => (e.key === 'Enter' || e.key === ' ') && selectPoint(pt, seg, e)
						: undefined}
					use:keyboardNav={keyboard}
				/>
			{/each}
		{/each}
	</g>
{/if}
