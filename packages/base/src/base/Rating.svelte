<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '../constants'
	const dispatch = createEventDispatcher()

	export let id = null
	export let name
	export let value = 0
	export let max = 5
	export let disabled = false
	export let stateIcons = defaultStateIcons.rating

	function handleClick(index) {
		if (!disabled) {
			value = value == 1 && index == 0 ? index : index + 1
			dispatch('change', { value })
		}
	}

	$: stars = [...Array(max).keys()].map((i) => i < value)
</script>

<rating {id} class="flex cursor-pointer select-none" class:disabled>
	<input
		{name}
		hidden
		type="number"
		bind:value
		min="0"
		{max}
		readOnly={disabled}
	/>
	{#each stars as selected, index}
		{@const stateIcon = selected ? stateIcons.filled : stateIcons.empty}
		<icon class={stateIcon} on:click={() => handleClick(index)} />
	{/each}
</rating>
