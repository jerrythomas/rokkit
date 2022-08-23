<script>
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let item
	export let fields

	function handleClick() {
		dispatch('remove', item)
	}
</script>

<pill class="flex flex-row items-center">
	{item[fields.text]}
	<icon class="remove" on:click={handleClick} />
</pill>
