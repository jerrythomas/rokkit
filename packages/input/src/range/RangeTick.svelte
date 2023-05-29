<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	export let label = ''
	export let value

	function handleClick() {
		dispatch('click', value)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<tick
	class="grid grid-cols-2 cursor-pointer select-none"
	on:click|stopPropagation={handleClick}
>
	<span class="col-start-2 h-5px border-l" />
	<p class="col-span-2 flex justify-center">
		{label}
	</p>
</tick>
