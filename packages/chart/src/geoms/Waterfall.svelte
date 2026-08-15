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

			// Place two (band, value) corners so the bar transposes under orientation flip.
			const c1 = plotState.place(xPos, barTop)
			const c2 = plotState.place(xPos + bw, barBottom)
			return {
				key: `${xVal}-${i}`,
				x: Math.min(c1.x, c2.x),
				y: Math.min(c1.y, c2.y),
				width: Math.abs(c2.x - c1.x),
				height: Math.max(1, Math.abs(c2.y - c1.y)),
				fill,
				bandStart: xPos,
				bandEnd: xPos + bw,
				cumY: yScale(cumulative) ?? 0,
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
