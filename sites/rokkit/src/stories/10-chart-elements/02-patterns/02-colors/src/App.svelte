<script>
	import { brewer, Swatch } from '@rokkit/chart'
	import { Select } from '@rokkit/input'

	let index = 0
	let shades = brewer().color().brew()

	$: variations = brewer()
		.pattern()
		.filter(index)
		.colors(shades)
		.variants(8)
		.brew()
</script>

<Swatch items={variations} type="circle" size={60} columns={4} autoscale />
