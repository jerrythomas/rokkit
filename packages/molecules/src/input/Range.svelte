<script>
	import RangeMinMax from './RangeMinMax.svelte'

	export let name = null
	/** @type {number} */
	export let min = 0
	/** @type {number} */
	export let max = 100
	/** @type {number} */
	export let value = min
	/** @type {number} */
	export let step = 1
	/** @type {number} */
	export let ticks = 10
	/** @type {number} */
	export let labelSkip = 0

	let bounds = [min, value]

	$: value = bounds[1]
</script>

<RangeMinMax bind:value={bounds} {name} {min} {max} {step} {ticks} {labelSkip} single />
