<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import { scaleSqrt } from 'd3-scale'
	import type { PlotState } from '../PlotState.svelte.js'
	import { buildPoints } from '../lib/brewing/marks/points.js'
	import { keyboardNav } from '../lib/keyboard-nav.js'
	import { buildSelectDetail } from '../lib/select.js'
	import LabelPill from './LabelPill.svelte'

	type Row = Record<string, unknown>
	type Options = {
		minRadius?: number
		maxRadius?: number
		radius?: number
		opacity?: number
		jitter?: { width?: number; height?: number } | null
		labelOffset?: { x?: number; y?: number }
	}

	type Props = {
		x?: string
		y?: string
		color?: string
		size?: string
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
		size,
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

	function selectPoint(pt: { data: Row }, event: MouseEvent | KeyboardEvent) {
		onselect?.(pt.data)
		if (plotState.interactive)
			plotState.handleSelect(
				buildSelectDetail(
					pt.data,
					plotState.data.indexOf(pt.data),
					{ x, y },
					'point',
					color ? pt.data[color] : undefined,
					event
				)
			)
	}

	onMount(() => {
		id = plotState.registerGeom({
			type: 'point',
			channels: { x, y, color, size, symbol: symbolField },
			stat,
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x, y, color, size, symbol: symbolField }, stat })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)
	const symbolMap = $derived(plotState.symbols)

	function buildSizeScale() {
		if (!size || !data?.length) return null
		const vals = data.map((d) => Number(d[size])).filter((v) => !isNaN(v))
		if (!vals.length) return null
		const minVal = Math.min(...vals)
		const maxVal = Math.max(...vals)
		const minRadius = options.minRadius ?? 3
		const maxRadius = options.maxRadius ?? 20
		return scaleSqrt().domain([minVal, maxVal]).range([minRadius, maxRadius])
	}

	const sizeScale = $derived.by(() => buildSizeScale())

	const defaultRadius = $derived(options.radius ?? 4)

	const points = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const raw = buildPoints(
			data,
			{ x, y, color, size, symbol: symbolField },
			xScale,
			yScale,
			colors,
			sizeScale,
			symbolMap,
			defaultRadius,
			options?.jitter ?? null
		)
		if (!plotState.isFlipped) return raw
		// Horizontal: swap each point's screen coords (value → screen-X, category → screen-Y).
		return raw.map((p) => {
			const s = plotState.place(p.cx, p.cy)
			return { ...p, cx: s.x, cy: s.y }
		})
	})
</script>

{#if points.length > 0}
	<g data-plot-geom="point">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		{#each points as pt, i (`${i}::${pt.data[x ?? '']}::${pt.data[y ?? '']}`)}
			{#if pt.symbolPath}
				<path
					transform="translate({pt.cx},{pt.cy})"
					d={pt.symbolPath}
					fill={pt.fill}
					stroke={pt.stroke}
					stroke-width="1"
					fill-opacity={options.opacity ?? plotState.chartPreset.opacity.point}
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
					fill-opacity={options.opacity ?? plotState.chartPreset.opacity.point}
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
				{@const text = resolveLabel(pt.data)}
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
