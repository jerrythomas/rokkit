<script>
	import { createEmitter, defaultStateIcons } from '@rokkit/core'
	import Icon from './Icon.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} [id]
	 * @property {any} [name]
	 * @property {number} [value]
	 * @property {number} [max]
	 * @property {boolean} [disabled]
	 * @property {any} [stateIcons]
	 * @property {string} [placeholder]
	 * @property {number} [tabindex]
	 * @event {CustomEvent} [onchange]
	 */

	/** @type {Props} */
	let {
		id = null,
		name = null,
		value = $bindable(0),
		max = 5,
		disabled = false,
		stateIcons = defaultStateIcons.rating,
		placeholder = 'Rating',
		tabindex = 0,
		...events
	} = $props()

	let emitter = $derived(createEmitter(events, ['change']))
	function handleClick(index) {
		if (!disabled) {
			value = value === 1 && index === 0 ? index : index + 1
			emitter.change({ value })
		}
	}
	function handleEnter(index) {
		if (!disabled) {
			hoverIndex = index
		}
	}
	function handleLeave() {
		if (!disabled) {
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

	let hoverIndex = $state(-1)
	let stars = $derived([...Array(max).keys()].map((i) => i < value))
</script>

<rk-rating
	{id}
	class="flex cursor-pointer select-none"
	class:disabled
	{tabindex}
	role="radiogroup"
	onkeydown={handleKeyDown}
>
	{#if name}
		<input {name} hidden type="number" bind:value min={0} {max} readOnly={disabled} />
	{/if}
	{#each stars as selected, index (index)}
		{@const stateIcon = selected ? stateIcons.filled : stateIcons.empty}
		{@const label = [placeholder, index + 1, 'out of', max].join(' ')}
		<Icon
			name={stateIcon}
			{label}
			role="option"
			{disabled}
			checked={index < value}
			class={index <= hoverIndex ? 'hovering' : ''}
			onmouseenter={() => handleEnter(index)}
			onmouseleave={handleLeave}
			onclick={() => handleClick(index)}
			tabindex="-1"
		/>
	{/each}
</rk-rating>
