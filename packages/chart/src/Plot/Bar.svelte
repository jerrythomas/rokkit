<script>
	import { getContext } from 'svelte'

	let { data = undefined, x = undefined, y = undefined, fill = 'steelblue', opacity = 1 } = $props()

	const state = getContext('plot-state')

	const bars = $derived.by(() => {
		if (!state?.xScale || !state?.yScale) return []
		const xScale = state.xScale
		const yScale = state.yScale
		const innerHeight = state.innerHeight
		const src = data ?? []
		if (!src.length) return []

		const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 20
		const padding = typeof xScale.bandwidth === 'function' ? bw * 0.05 : 0

		return src.map((d) => {
			const xVal = x ? d[x] : d
			const yVal = y ? d[y] : d
			const xPos = (xScale(xVal) ?? 0) + padding
			const yPos = yScale(yVal) ?? 0
			return {
				x: xPos,
				y: yPos,
				width: bw * 0.9,
				height: innerHeight - yPos,
				label: `${xVal}: ${yVal}`
			}
		})
	})
</script>

{#each bars as bar, i (i)}
	<rect
		x={bar.x}
		y={bar.y}
		width={bar.width}
		height={bar.height}
		{fill}
		{opacity}
		data-plot-element="bar"
		role="graphics-symbol"
		aria-label={bar.label}
	/>
{/each}
