<script>
	import RangeMinMax from './RangeMinMax.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} [name]
	 * @property {string} [class]
	 * @property {number} [min]
	 * @property {number} [max]
	 * @property {number} [value]
	 * @property {number} [step]
	 * @property {number} [ticks]
	 * @property {number} [labelSkip]
	 */

	/** @type {Props} */
	let {
		name = null,
		class: classes = '',
		min = 0,
		max = 100,
		value = $bindable(min),
		step = 1,
		ticks = 10,
		labelSkip = 0
	} = $props()

	let bounds = $state([min, value])

	$effect(() => {
		value = bounds[1]
	})
</script>

<RangeMinMax
	bind:value={bounds}
	{name}
	{min}
	{max}
	{step}
	{ticks}
	{labelSkip}
	single
	class={classes}
/>
