<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'

	const dispatch = createEventDispatcher()

	export let item
	export let fields

	function handleClick() {
		dispatch('remove', item)
	}
</script>

<pill class="flex flex-row items-center">
	{item[fields.text]}
	<icon class={defaultStateIcons.item.remove} on:click={handleClick} />
</pill>
