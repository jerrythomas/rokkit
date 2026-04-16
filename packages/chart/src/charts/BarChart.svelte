<script>
	import Plot from '../Plot.svelte'
	import Bar from '../geoms/Bar.svelte'

	/** @type {import('../lib/plot/chartProps.js').BarChartProps} */
	let {
		data = [],
		x = undefined,
		y = undefined,
		fill = undefined, // mapped to color channel
		pattern = undefined,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		stat = 'identity',
		stack = false,
		label = false,
		tooltip = false,
		xFormat = undefined,
		yFormat = undefined,
		xTicks = undefined,
		yTicks = undefined,
		minorTicks = false
	} = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {tooltip} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Bar {x} {y} color={fill} {pattern} {label} {stat} options={{ stack }} />
</Plot>
