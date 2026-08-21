<script>
	import Spark from '../../src/Spark.svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	// The micro form: <Radar> composed inside <Spark>, exactly as <Line> is in
	// SparkHarness. A geom always takes its own channel props under Spark, same as
	// under a full Plot.
	let {
		data = [],
		axis = 'metric',
		value = 'score',
		series = undefined,
		axes = undefined,
		width = undefined,
		height = undefined,
		options = {}
	} = $props()
</script>

<Spark {data} x={axis} y={value} color={series} {width} {height}>
	<Radar {axis} {value} {series} {axes} {options} />
</Spark>
