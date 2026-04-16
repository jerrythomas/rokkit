<script>
	import { getContext, onMount, onDestroy } from 'svelte'

	let {
		x,
		y,
		color = undefined,
		fill: fillProp = undefined,
		stat = 'identity',
		options = {}
	} = $props()

	const positiveColor = $derived(options.positiveColor ?? '#22c55e')
	const negativeColor = $derived(options.negativeColor ?? '#ef4444')
	const totalColor = $derived(options.totalColor ?? '#3b82f6')
	const totalField = $derived(options.totalField ?? undefined)
	const connectorWidth = $derived(options.connectorWidth ?? 0.5)

	const plotState = getContext('plot-state')
	let id = $state(null)

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

	const bars = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10

		let cumulative = 0
		return data.map((d, i) => {
			const xVal = d[x]
			const yVal = Number(d[y])
			const isTotal = totalField ? Boolean(d[totalField]) : false
			const xPos = xScale(xVal) ?? 0
			let barTop, barBottom, fill

			if (isTotal) {
				barTop = yScale(Math.max(0, cumulative))
				barBottom = yScale(0)
				fill = totalColor
			} else {
				const start = cumulative
				cumulative += yVal
				barTop = yScale(Math.max(start, cumulative))
				barBottom = yScale(Math.min(start, cumulative))
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
				onmouseenter={() => plotState.setHovered(bar.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{bar.data[x]}: {bar.data[y]}</title>
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
