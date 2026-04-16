<script>
	import { getContext, onMount, onDestroy } from 'svelte'

	let {
		x,
		y: _y = undefined,
		color = undefined,
		fill: fillProp = undefined,
		stat = 'identity',
		options = {}
	} = $props()

	const open = $derived(options.open ?? 'open')
	const high = $derived(options.high ?? 'high')
	const low = $derived(options.low ?? 'low')
	const close = $derived(options.close ?? 'close')
	const upColor = $derived(options.upColor ?? '#22c55e')
	const downColor = $derived(options.downColor ?? '#ef4444')
	const wickWidth = $derived(options.wickWidth ?? 1)

	const plotState = getContext('plot-state')
	let id = $state(null)

	onMount(() => {
		// Register with y pointing to 'high' so the y scale covers the full range
		id = plotState.registerGeom({
			type: 'candlestick',
			channels: { x, y: high, color: fillProp ?? color },
			stat
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y: high, color: fillProp ?? color },
				stat
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)

	const candles = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10
		const bodyWidth = bw * 0.6
		const bodyOffset = (bw - bodyWidth) / 2

		return data.map((d, i) => {
			const xPos = (xScale(d[x]) ?? 0) + bodyOffset
			const openVal = Number(d[open])
			const closeVal = Number(d[close])
			const highVal = Number(d[high])
			const lowVal = Number(d[low])
			const isUp = closeVal >= openVal
			const bodyTop = yScale(isUp ? closeVal : openVal)
			const bodyBottom = yScale(isUp ? openVal : closeVal)

			return {
				key: `${d[x]}-${i}`,
				// Body
				bodyX: xPos,
				bodyY: bodyTop,
				bodyWidth,
				bodyHeight: Math.max(1, bodyBottom - bodyTop),
				fill: isUp ? upColor : downColor,
				// Wick
				wickX: xPos + bodyWidth / 2,
				wickTop: yScale(highVal),
				wickBottom: yScale(lowVal),
				data: d
			}
		})
	})
</script>

{#if candles.length > 0}
	<g data-plot-geom="candlestick">
		{#each candles as c (c.key)}
			<!-- Wick (high to low) -->
			<line
				x1={c.wickX}
				y1={c.wickTop}
				x2={c.wickX}
				y2={c.wickBottom}
				stroke={c.fill}
				stroke-width={wickWidth}
				data-plot-element="wick"
			/>
			<!-- Body (open to close) -->
			<rect
				x={c.bodyX}
				y={c.bodyY}
				width={c.bodyWidth}
				height={c.bodyHeight}
				fill={c.fill}
				data-plot-element="candle"
				onmouseenter={() => plotState.setHovered(c.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{c.data[x]}: O={c.data[open]} H={c.data[high]} L={c.data[low]} C={c.data[close]}</title>
			</rect>
		{/each}
	</g>
{/if}
