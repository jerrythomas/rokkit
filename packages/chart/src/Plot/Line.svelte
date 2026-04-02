<script>
	import { getContext } from 'svelte'
	import { line as d3Line } from 'd3-shape'

	let {
		data = [],
		x = undefined,
		y = undefined,
		stroke = 'steelblue',
		strokeWidth = 2,
		curve = undefined
	} = $props()

	const state = getContext('plot-state')

	const path = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return null
		const lineGen = d3Line()
			.x((d) => state.xScale(x ? d[x] : d) ?? 0)
			.y((d) => state.yScale(y ? d[y] : d) ?? 0)
			.defined((d) => d != null)
		if (curve) lineGen.curve(curve)
		return lineGen(data)
	})
</script>

{#if path}
	<path
		d={path}
		fill="none"
		{stroke}
		stroke-width={strokeWidth}
		stroke-linejoin="round"
		stroke-linecap="round"
		data-plot-element="line"
	/>
{/if}
