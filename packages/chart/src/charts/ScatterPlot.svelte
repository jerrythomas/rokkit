<script>
	import Plot from '../Plot.svelte'
	import Point from '../geoms/Point.svelte'

	/** @type {import('../lib/plot/chartProps.js').ScatterBubbleChartProps} */
	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		symbol = undefined,
		size = undefined,
		label = false,
		tooltip = false,
		width = 600,
		height = 400,
		mode = 'light',
		grid = true,
		legend = false,
		jitter = undefined
	} = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend} {tooltip}>
	<Point {x} {y} {color} {size} {symbol} {label} options={{ jitter }} />
</Plot>
