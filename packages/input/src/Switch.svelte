<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let label = 'Use Setting'
	export let value = false
	export let tabindex = 0

	function toggle() {
		value = !value
		dispatch('change', { value })
	}
</script>

<button
	role="switch"
	class="flex rounded-full relative"
	{tabindex}
	aria-checked={value}
	class:checked={value}
	on:click={toggle}
>
	<span class="hidden">{label}</span>
	<mark
		aria-hidden="true"
		class="rounded-full absolute"
		class:is-on={value}
		class:is-off={!value}
	/>
</button>

<style>
	.is-on {
		@apply right-1;
	}
	.is-off {
		@apply left-1;
	}
</style>
