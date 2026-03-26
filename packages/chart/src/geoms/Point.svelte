<script>
	import { getContext, onMount, onDestroy } from 'svelte'
	import { scaleSqrt } from 'd3-scale'
	import { buildPoints } from '../lib/brewing/marks/points.js'
	import LabelPill from './LabelPill.svelte'

	let {
		x,
		y,
		color,
		size,
		symbol: symbolField,
		label = false,
		stat = 'identity',
		options = {}
	} = $props()

	/**
	 * @param {Record<string, unknown>} data
	 * @returns {string | null}
	 */
	function resolveLabel(data) {
		if (!label) return null
		if (label === true) return String(data[y] ?? '')
		if (typeof label === 'function') return String(label(data) ?? '')
		return typeof label === 'string' ? String(data[label] ?? '') : null
	}

	const plotState = getContext('plot-state')
	let id = $state(null)

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
		return buildPoints(
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
	})
</script>

{#if points.length > 0}
	<g data-plot-geom="point">
		{#each points as pt, i (`${i}::${pt.data[x]}::${pt.data[y]}`)}
			{#if pt.symbolPath}
				<path
					transform="translate({pt.cx},{pt.cy})"
					d={pt.symbolPath}
					fill={pt.fill}
					stroke={pt.stroke}
					stroke-width="1"
					fill-opacity={options.opacity ?? plotState.chartPreset.opacity.point}
					data-plot-element="point"
					role="graphics-symbol"
					aria-label="{pt.data[x]}, {pt.data[y]}"
					onmouseenter={() => plotState.setHovered(pt.data)}
					onmouseleave={() => plotState.clearHovered()}
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
					role="graphics-symbol"
					aria-label="{pt.data[x]}, {pt.data[y]}"
					onmouseenter={() => plotState.setHovered(pt.data)}
					onmouseleave={() => plotState.clearHovered()}
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
