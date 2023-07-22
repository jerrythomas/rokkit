<script>
	import RangeMinMax from './RangeMinMax.svelte'

	export let min = 0
	export let max = 100
	export let value = min
	export let step = 1
	export let ticks = 10
	export let labelSkip = 0

	let bounds = [min, value]

	$: value = bounds[1]
</script>

<RangeMinMax
	bind:value={bounds}
	{min}
	{max}
	{step}
	{ticks}
	{labelSkip}
	single
/>
