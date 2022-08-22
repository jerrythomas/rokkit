<script>
	import RangeSlider from './RangeSlider.svelte'

	export let min
	export let max
	export let value = min
	export let step
	export let tickStep
	export let labelSkip

	let bounds = [min, value]

	$: value = bounds[1]
	$: console.log('range ', value)
</script>

<RangeSlider
	bind:value={bounds}
	{min}
	{max}
	{step}
	{tickStep}
	{labelSkip}
	single
/>
