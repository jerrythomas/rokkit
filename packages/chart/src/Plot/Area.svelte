<script>
	import { getContext } from 'svelte'
	import { area as d3Area } from 'd3-shape'

	let {
		data = [],
		x = undefined,
		y = undefined,
		y0 = undefined,
		fill = 'steelblue',
		opacity = 0.7,
		curve = undefined
	} = $props()

	const state = getContext('plot-state')

	const path = $derived.by(() => {
		if (!state?.xScale || !state?.yScale || !data?.length) return null
		const innerHeight = state.innerHeight
		const areaGen = d3Area()
			.x((d) => state.xScale(x ? d[x] : d) ?? 0)
			.y1((d) => state.yScale(y ? d[y] : d) ?? 0)
			.y0((d) => (y0 !== undefined ? state.yScale(d[y0] ?? y0) : innerHeight) ?? innerHeight)
			.defined((d) => d != null)
		if (curve) areaGen.curve(curve)
		return areaGen(data)
	})
</script>

{#if path}
	<path d={path} {fill} {opacity} stroke="none" data-plot-element="area" />
{/if}
