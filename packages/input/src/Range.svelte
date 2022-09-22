<script>
	import RangeMinMax from './RangeMinMax.svelte'

	export let min
	export let max
	export let value = min
	export let step
	export let tickStep
	export let labelSkip

	let bounds = [min, value]

	$: value = bounds[1]
</script>

<RangeMinMax
	bind:value={bounds}
	{min}
	{max}
	{step}
	{tickStep}
	{labelSkip}
	single
/>
