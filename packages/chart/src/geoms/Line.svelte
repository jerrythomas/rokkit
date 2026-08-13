<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { buildLines } from '../lib/brewing/marks/lines.js'
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
		color?: string
		symbol?: string
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
		symbol: symbolField,
		label = false,
		stat = 'identity',
		options = {},
		onselect = undefined,
		keyboard = false
	}: Props = $props()

	function resolveLabel(data: Row): string | null {
		if (!label) return null
		if (label === true) return String((y ? data[y] : undefined) ?? '')
		if (typeof label === 'function') return String(label(data) ?? '')
		return typeof label === 'string' ? String(data[label] ?? '') : null
	}

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	function selectPoint(
		pt: { data: Row },
		seg: { key?: unknown },
		event: MouseEvent | KeyboardEvent
	) {
		onselect?.(pt.data)
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail(pt.data, plotState.data.indexOf(pt.data), { x, y }, 'line', seg?.key, event)
			)
	}

	onMount(() => {
		id = plotState.registerGeom({
			type: 'line',
			channels: { x, y, color, symbol: symbolField },
			stat,
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x, y, color, symbol: symbolField }, stat })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)
	const symbolMap = $derived(plotState.symbols)

	const lines = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildLines(data, { x, y, color }, xScale, yScale, colors, options.curve)
	})

	const markerRadius = $derived(options.markerRadius ?? 4)
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
					{@const text = resolveLabel(pt.data)}
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
