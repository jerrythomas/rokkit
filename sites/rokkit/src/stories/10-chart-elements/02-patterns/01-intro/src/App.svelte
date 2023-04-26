<script>
	import { brewer, Swatch } from '@rokkit/chart'
	let variations = brewer().pattern().brew()
</script>

<Swatch items={variations} type="circle" size={60} columns={4} autoscale />
