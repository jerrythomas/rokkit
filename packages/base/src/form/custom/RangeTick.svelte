<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	export let label = ''
	export let value

	function handleClick() {
		dispatch('click', value)
	}
</script>

<tick
	class="grid grid-cols-2 select-none cursor-pointer"
	on:click|stopPropagation={handleClick}
>
	<span class="col-start-2 border-l h-5px" />
	<p class="col-span-2 flex justify-center">
		{label}
	</p>
</tick>
