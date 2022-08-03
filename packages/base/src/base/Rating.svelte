<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'
	const dispatch = createEventDispatcher()

	export let id
	export let value = 0
	export let max = 5
	export let readOnly = false
	export let stateIcons = defaultStateIcons.rating

	function handleClick(index) {
		if (!readOnly) {
			value = value == 1 && index == 0 ? index : index + 1
			dispatch('change', { value })
		}
	}

	$: stars = [...Array(max).keys()].map((i) => i < value)
</script>

<rating {id} class="flex cursor-pointer select-none" class:readOnly>
	{#each stars as selected, index}
		{#if selected}
			<icon class={stateIcons.filled} on:click={() => handleClick(index)} />
		{:else}
			<icon class={stateIcons.empty} on:click={() => handleClick(index)} />
		{/if}
	{/each}
</rating>
