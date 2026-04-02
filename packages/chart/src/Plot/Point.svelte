<script>
	import { getContext } from 'svelte'

	let {
		data = [],
		x = undefined,
		y = undefined,
		r = 4,
		fill = 'steelblue',
		stroke = 'white',
		strokeWidth = 1
	} = $props()

	const state = getContext('plot-state')

	const points = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return []
		return data
			.map((d) => ({
				cx: state.xScale(x ? d[x] : d) ?? null,
				cy: state.yScale(y ? d[y] : d) ?? null,
				label: `(${x ? d[x] : d}, ${y ? d[y] : d})`
			}))
			.filter((p) => p.cx !== null && p.cy !== null)
	})
</script>

{#each points as pt, i (i)}
	<circle
		cx={pt.cx}
		cy={pt.cy}
		{r}
		{fill}
		{stroke}
		stroke-width={strokeWidth}
		data-plot-element="point"
		role="graphics-symbol"
		aria-label={pt.label}
	/>
{/each}
