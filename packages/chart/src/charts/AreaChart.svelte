<script>
	import Plot from '../Plot.svelte'
	import Area from '../geoms/Area.svelte'

	/** @type {import('../lib/plot/chartProps.js').LineAreaChartProps} */
	let {
		data = [],
		x = undefined,
		y = undefined,
		fill = undefined,
		stat = 'identity',
		curve = undefined,
		pattern = undefined,
		stack = false,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false
	} = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Area {x} {y} color={fill} {pattern} {stat} options={{ curve, stack }} />
</Plot>
