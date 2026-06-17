<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

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
		stat?: string
		options?: Options
	}

	let {
		x,
		y,
		color = undefined,
		fill: fillProp = undefined,
		stat = 'identity',
		options = {}
	}: Props = $props()

	const positiveColor = $derived(options.positiveColor ?? '#22c55e')
	const negativeColor = $derived(options.negativeColor ?? '#ef4444')
	const totalColor = $derived(options.totalColor ?? '#3b82f6')
	const totalField = $derived(options.totalField ?? undefined)
	const connectorWidth = $derived(options.connectorWidth ?? 0.5)

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'waterfall',
			channels: { x, y, color: fillProp ?? color },
			stat
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color: fillProp ?? color },
				stat
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)

	// eslint-disable-next-line max-lines-per-function
	const bars = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10

		let cumulative = 0
		return data.map((d, i) => {
			const xVal = d[x ?? '']
			const yVal = Number(d[y ?? ''])
			const isTotal = totalField ? Boolean(d[totalField]) : false
			const xPos = xScale(xVal) ?? 0
			let barTop: number
			let barBottom: number
			let fill: string

			if (isTotal) {
				barTop = yScale(Math.max(0, cumulative)) ?? 0
				barBottom = yScale(0) ?? 0
				fill = totalColor
			} else {
				const start = cumulative
				cumulative += yVal
				barTop = yScale(Math.max(start, cumulative)) ?? 0
				barBottom = yScale(Math.min(start, cumulative)) ?? 0
				fill = yVal >= 0 ? positiveColor : negativeColor
			}

			return {
				key: `${xVal}-${i}`,
				x: xPos,
				y: barTop,
				width: bw,
				height: Math.max(1, barBottom - barTop),
				fill,
				cumulative,
				data: d
			}
		})
	})
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
				data-plot-element="waterfall-bar"
				role="img"
				onmouseenter={() => plotState.setHovered(bar.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{bar.data[x ?? '']}: {bar.data[y ?? '']}</title>
			</rect>
			<!-- Connector line to next bar -->
			{#if i < bars.length - 1}
				<line
					x1={bar.x + bar.width}
					y1={yScale(bar.cumulative)}
					x2={bars[i + 1].x}
					y2={yScale(bar.cumulative)}
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
