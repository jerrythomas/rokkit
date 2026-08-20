<script>
	import Spark from '../../src/Spark.svelte'
	import Line from '../../src/geoms/Line.svelte'

	let {
		data = [],
		x = 'day',
		y = 'sales',
		color = undefined,
		width = undefined,
		height = undefined,
		min = undefined,
		max = undefined,
		baseline = undefined
	} = $props()
</script>

<Spark {data} {x} {y} {color} {width} {height} {min} {max} {baseline}>
	<!-- A geom always needs its own x/y, same as under a full Plot (e.g.
	     charts/LineChart.svelte forwards {x} {y} to <Line> alongside Plot's own config) —
	     the container's channels drive its scale domain, not a child geom's channel props. -->
	<Line {x} {y} />
</Spark>
