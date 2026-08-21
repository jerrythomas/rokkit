<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildPointMarks } from './lib/marks/point.js'
	import { resolveLabel } from './lib/aesthetics.js'
	import { keyboardNav } from '../lib/keyboard-nav.js'
	import { buildSelectDetail } from '../lib/select.js'
	import LabelPill from './LabelPill.svelte'

	type Row = Record<string, unknown>
	type Options = {
		minRadius?: number
		maxRadius?: number
		radius?: number
		jitter?: { width?: number; height?: number } | null
		labelOffset?: { x?: number; y?: number }
	}

	type Props = {
		x?: string
		y?: string
		/** Outline / point-stroke aesthetic (field). */
		color?: string
		/** Interior aesthetic (field); falls back to `color` when omitted. */
		fill?: string
		size?: string
		symbol?: string
		/** Fixed mark opacity 0–1; defaults to the per-geom preset (point = 0.8). */
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
		size,
		symbol: symbolField,
		alpha,
		label = false,
		stat = 'identity',
		options = {},
		onselect = undefined,
		keyboard = false
	}: Props = $props()

	const plotState = getContext<PlotState>('plot-state')

	// All plumbing (register/data/scales/colors) + mark building (geometry + fill/color/alpha)
	// lives in GeomState + buildPointMarks. This component only renders + handles interactivity.
	const geom = new GeomState(plotState, () => ({
		type: 'point',
		channels: { x, y, color, fill, size, symbol: symbolField },
		stat,
		options,
		alpha,
		build: buildPointMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const points = $derived(geom.marks)

	const seriesField = $derived(fill ?? color)

	function selectPoint(pt: { data: Row }, event: MouseEvent | KeyboardEvent) {
		onselect?.(pt.data)
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail({
					datum: pt.data,
					index: plotState.data.indexOf(pt.data),
					channels: { x, y },
					geom: 'point',
					series: seriesField ? pt.data[seriesField] : undefined,
					event
				})
			)
	}
</script>

{#if points.length > 0}
	<g data-plot-geom="point">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		{#each points as pt (pt.key)}
			{#if pt.symbolPath}
				<path
					transform="translate({pt.cx},{pt.cy})"
					d={pt.symbolPath}
					fill={pt.fill}
					stroke={pt.stroke}
					stroke-width="1"
					fill-opacity={pt.alpha}
					data-plot-element="point"
					role={onselect || keyboard || plotState.interactive ? 'button' : 'graphics-symbol'}
					tabindex={onselect || keyboard || plotState.interactive ? 0 : undefined}
					style:cursor={onselect || keyboard || plotState.interactive ? 'pointer' : undefined}
					aria-label="{pt.data[x ?? '']}, {pt.data[y ?? '']}"
					onmouseenter={() => plotState.setHovered(pt.data)}
					onmouseleave={() => plotState.clearHovered()}
					onclick={onselect || keyboard || plotState.interactive ? (e) => selectPoint(pt, e) : undefined}
					onkeydown={onselect || keyboard || plotState.interactive
						? (e) => (e.key === 'Enter' || e.key === ' ') && selectPoint(pt, e)
						: undefined}
					use:keyboardNav={keyboard}
				/>
			{:else}
				<circle
					cx={pt.cx}
					cy={pt.cy}
					r={pt.r}
					fill={pt.fill}
					stroke={pt.stroke}
					stroke-width="1"
					fill-opacity={pt.alpha}
					data-plot-element="point"
					role={onselect || keyboard || plotState.interactive ? 'button' : 'graphics-symbol'}
					tabindex={onselect || keyboard || plotState.interactive ? 0 : undefined}
					style:cursor={onselect || keyboard || plotState.interactive ? 'pointer' : undefined}
					aria-label="{pt.data[x ?? '']}, {pt.data[y ?? '']}"
					onmouseenter={() => plotState.setHovered(pt.data)}
					onmouseleave={() => plotState.clearHovered()}
					onclick={onselect || keyboard || plotState.interactive ? (e) => selectPoint(pt, e) : undefined}
					onkeydown={onselect || keyboard || plotState.interactive
						? (e) => (e.key === 'Enter' || e.key === ' ') && selectPoint(pt, e)
						: undefined}
					use:keyboardNav={keyboard}
				/>
			{/if}
			{#if label}
				{@const text = resolveLabel(label, pt.data, y)}
				{#if text}
					<LabelPill
						x={pt.cx + (options.labelOffset?.x ?? 0)}
						y={pt.cy - pt.r + (options.labelOffset?.y ?? -12)}
						{text}
						color={pt.stroke ?? '#333'}
					/>
				{/if}
			{/if}
		{/each}
	</g>
{/if}
