<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'
	const dispatch = createEventDispatcher()

	export let id = null
	export let name = null
	export let value = 0
	export let max = 5
	export let disabled = false
	export let stateIcons = defaultStateIcons.rating
	export let placeholder = 'Rating'
	export let tabindex = 0

	function handleClick(index) {
		if (!disabled) {
			value = value === 1 && index === 0 ? index : index + 1
			dispatch('change', { value })
		}
	}
	function handleEnter(index) {
		if (!disabled) {
			// hovering = true
			hoverIndex = index
		}
	}
	function handleLeave() {
		if (!disabled) {
			// hovering = false
			hoverIndex = -1
		}
	}
	function handleKeyDown(event) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault()
			value = Math.max(value - 1, 0)
		} else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault()
			value = Math.min(value + 1, max)
		} else {
			var number = parseInt(event.code.replace('Digit', ''), 10)
			if (number >= 0 && number <= 9 && number <= max) {
				event.preventDefault()
				value = number
			}
		}
	}

	// let hovering = false
	let hoverIndex = -1
	$: stars = [...Array(max).keys()].map((i) => i < value)
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<rating
	{id}
	class="flex cursor-pointer select-none"
	class:disabled
	{tabindex}
	role="radiogroup"
	on:focus
	on:blur
	on:keydown={handleKeyDown}
>
	{#if name}
		<input {name} hidden type="number" bind:value min={0} {max} readOnly={disabled} />
	{/if}
	{#each stars as selected, index}
		{@const stateIcon = selected ? stateIcons.filled : stateIcons.empty}
		{@const label = [placeholder, index + 1, 'out of', max].join(' ')}
		<Icon
			name={stateIcon}
			{label}
			role="option"
			{disabled}
			checked={index < value}
			class={index <= hoverIndex ? 'hovering' : ''}
			on:mouseenter={() => handleEnter(index)}
			on:mouseleave={handleLeave}
			on:click={() => handleClick(index)}
			tabindex="-1"
		/>
	{/each}
</rating>
