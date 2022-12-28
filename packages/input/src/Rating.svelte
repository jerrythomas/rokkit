<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '@rokkit/core'
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

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<rating
	{id}
	class="flex cursor-pointer select-none"
	class:disabled
	tabindex="0"
	on:focus
	on:blur
>
	{#if name}
		<input
			{name}
			hidden
			type="number"
			bind:value
			min={0}
			{max}
			readOnly={disabled}
		/>
	{/if}
	{#each stars as selected, index}
		{@const stateIcon = selected ? stateIcons.filled : stateIcons.empty}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<icon class={stateIcon} on:click={() => handleClick(index)} />
	{/each}
</rating>
