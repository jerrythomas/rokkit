<script>
	import Plot from '../Plot.svelte'
	import Violin from '../geoms/Violin.svelte'

	/** @type {import('../lib/plot/chartProps.js').BoxViolinChartProps} */
	let {
		data = [],
		x = undefined,
		y = undefined,
		fill = undefined,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		yFormat = undefined,
		yTicks = undefined,
		minorTicks = false
	} = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {yFormat} {yTicks} {minorTicks}>
	<Violin {x} {y} {fill} />
</Plot>
