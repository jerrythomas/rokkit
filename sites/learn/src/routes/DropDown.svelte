<script>
	import { equals } from 'ramda'
	import { FieldMapper } from '@rokkit/core'
	import { Item } from '@rokkit/ui'
	import { onMount } from 'svelte'

	let { value = $bindable(), options = [], mapping = new FieldMapper() } = $props()

	// let selectedOption = 'Source Type'
	let isOpen = $state(false)

	function toggleSelect() {
		isOpen = !isOpen
	}

	function selectOption(event) {
		value = options[event.currentTarget.dataset.index]
		// selectedOption = option.text
		isOpen = false
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside)
	})

	function handleClickOutside(event) {
		if (!event.target.closest('.custom-select')) {
			isOpen = false
		}
	}
</script>

<div class="custom-select-wrapper">
	<div class="custom-select" class:opened={isOpen}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="custom-select-trigger" onclick={toggleSelect}>
			<item><Item {value} {mapping}></Item> </item>
		</span>
		<div class="custom-options">
			{#each options as option, index (index)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<rk-item aria-selected={equals(option, value)} data-index={index} onclick={selectOption}>
					<Item value={option} {mapping}></Item>
				</rk-item>
				<!-- <span class="custom-option {option.text === selectedOption ? 'selection' : ''}" on:click={() => selectOption(option)}>{option.text}</span> -->
			{/each}
		</div>
	</div>
</div>

<style>
	/** Custom Select **/
	.custom-select-wrapper {
		@apply relative inline-block min-w-40 select-none p-0;
		/* position: relative;
		display: inline-block;
		user-select: none; */
	}
	.custom-select {
		@apply relative inline-block w-full p-0;
		/* position: relative;
		display: inline-block; */
	}
	.custom-select-trigger {
		@apply relative block w-full cursor-pointer rounded-md;
		@apply flex w-full flex-row;
		@apply bg-blue-200 text-white;
		/* position: relative;
		display: block;
		width: 130px; */
		/* padding: 0 84px 0 22px;
		font-size: 22px;
		font-weight: 300;
		color: #fff;
		line-height: 60px;*/
		/* background: #5c9cd8; */
		/*border-radius: 4px;
		cursor: pointer; */
	}
	.custom-select-trigger:after {
		@apply -mt-3px content-'' border-b-1 border-r-1 absolute right-2 top-1/2 block h-10 w-10;
		@apply transform-rotate-45 translate-y-(-50%) transition-all-0.4s transform-origin-50%-0 ease-in-out;
		/* position: absolute;
		display: block;
		content: '';
		width: 10px;
		height: 10px;
		top: 50%;
		right: 25px; */
		/* margin-top: -3px; */
		/* border-bottom: 1px solid #fff;
		border-right: 1px solid #fff;
		transform: rotate(45deg) translateY(-50%);
		transition: all 0.4s ease-in-out;
		transform-origin: 50% 0; */
	}
	.custom-select.opened .custom-select-trigger:after {
		@apply transform-rotate-(-135deg) translate-y-(-50%);
		/* margin-top: 3px;
		transform: rotate(-135deg) translateY(-50%); */
	}
	.custom-options {
		@apply m-15px-0 border-1 shadow-0-2px-1px transition-all-0.4s-ease-in-out absolute left-0 right-0 top-full box-border block min-w-full rounded-md border-gray-300 bg-white;
		/* position: absolute;
		display: block;
		top: 100%;
		left: 0;
		right: 0;
		min-width: 100%;
		margin: 15px 0;
		border: 1px solid #b5b5b5;
		border-radius: 4px;
		box-sizing: border-box; */
		/* box-shadow: 0 2px 1px rgba(0, 0, 0, 0.07); */
		/* background: #fff; */
		/* transition: all 0.4s ease-in-out; */
		@apply visibility-hidden transform-translate-y-(-15px) pointer-events-none opacity-0;
		/* opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(-15px); */
	}
	.custom-select.opened .custom-options {
		@apply visibility-visible pointer-events-all transform-translate-y-0;
		/* opacity: 1;
		visibility: visible;
		pointer-events: all;
		transform: translateY(0); */
	}
	.custom-options:before {
		@apply content-'' right-25px border-t-1 border-l-1;
		@apply transform-rotate-45 transition-all-0.4s-ease-in-out;
		@apply absolute bottom-full block bg-white;
		/* position: absolute;
		display: block;
		content: '';
		bottom: 100%;
		right: 25px;
		width: 7px;
		height: 7px;
		margin-bottom: -4px;
		border-top: 1px solid #b5b5b5;
		border-left: 1px solid #b5b5b5;
		background: #fff;
		transform: rotate(45deg);
		transition: all 0.4s ease-in-out; */
	}
	/* .option-hover:before {
		background: #f9f9f9;
	} */
	rk-item {
		@apply relative block min-h-10 w-full border-gray-300;
		@apply flex cursor-pointer flex-row items-center gap-2 text-lg text-gray-900;
		@apply transition-all-0.4s-ease-in-out;
		/* transition: all 0.4s ease-in-out; */
	}
	rk-item:first-of-type {
		@apply rounded-t-md;
	}
	rk-item:last-of-type {
		@apply border-bottom-none rounded-b-md;
		/* border-bottom: 0;
		border-radius: 0 0 4px 4px; */
	}
	rk-item:hover {
		@apply bg-gray-200;
		/* background: #f9f9f9; */
	}
	rk-item[aria-selected='true'] {
		@apply bg-red-300;
		/* background: #f9f9f9; */
	}
</style>
