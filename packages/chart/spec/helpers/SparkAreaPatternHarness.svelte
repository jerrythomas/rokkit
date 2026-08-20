<script>
	import Spark from '../../src/Spark.svelte'
	import Area from '../../src/geoms/Area.svelte'

	// Dedicated harness for the SparkState.patterns integration check: `pattern` is the
	// literal texture name passed straight to `<Spark>` (see SparkState.patterns' doc
	// comment); `areaPattern` is the CHANNEL name forwarded to `<Area pattern>` — a field
	// on each data row, here always holding the same literal name, mirroring how a
	// consumer would point a geom's pattern channel at a column that names a pattern.
	let {
		data = [],
		x = 'day',
		y = 'sales',
		pattern = undefined,
		areaPattern = undefined,
		width = undefined,
		height = undefined
	} = $props()
</script>

<Spark {data} {x} {y} {width} {height} {pattern}>
	<Area {x} {y} pattern={areaPattern} />
</Spark>
