<script>
	import Spark from '../../src/Spark.svelte'
	import Line from '../../src/geoms/Line.svelte'

	// A dedicated harness for the accessibility spec rather than extending the shared
	// SparkHarness, so no pre-existing helper changes shape for the specs already using it.
	let {
		data = [],
		x = 'x',
		y = 'y',
		label = undefined,
		width = undefined,
		height = undefined
	} = $props()
</script>

<Spark {data} {x} {y} {label} {width} {height}>
	<Line {x} {y} />
</Spark>
