<script>
	import { equals } from 'ramda'
	import { FieldMapper } from '@rokkit/core'
	import { onMount } from 'svelte'

	let { value = $bindable(), options = [], mapping = new FieldMapper() } = $props()

	let isOpen = $state(false)

	function toggleSelect() {
		isOpen = !isOpen
	}

	function selectOption(event) {
		value = options[event.currentTarget.dataset.index]
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
			<item>{mapping.text(value)}</item>
		</span>
		<div class="custom-options">
			{#each options as option, index (index)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<rk-item aria-selected={equals(option, value)} data-index={index} onclick={selectOption}>
					{mapping.text(option)}
				</rk-item>
			{/each}
		</div>
	</div>
</div>

<style>
	/** Custom Select **/
	.custom-select-wrapper {
		@apply relative inline-block min-w-40 select-none p-0;
	}
	.custom-select {
		@apply relative inline-block w-full p-0;
	}
	.custom-select-trigger {
		@apply relative block w-full cursor-pointer rounded-md;
		@apply flex w-full flex-row;
		@apply bg-blue-200 text-white;
	}
	.custom-select-trigger:after {
		@apply -mt-3px content-'' border-b-1 border-r-1 absolute right-2 top-1/2 block h-10 w-10;
		@apply transform-rotate-45 translate-y-(-50%) transition-all-0.4s transform-origin-50%-0 ease-in-out;
	}
	.custom-select.opened .custom-select-trigger:after {
		@apply transform-rotate-(-135deg) translate-y-(-50%);
	}
	.custom-options {
		@apply m-15px-0 border-1 shadow-0-2px-1px transition-all-0.4s-ease-in-out absolute left-0 right-0 top-full box-border block min-w-full rounded-md border-gray-300 bg-white;
		@apply visibility-hidden transform-translate-y-(-15px) pointer-events-none opacity-0;
	}
	.custom-select.opened .custom-options {
		@apply visibility-visible pointer-events-all transform-translate-y-0;
	}
	.custom-options:before {
		@apply content-'' right-25px border-t-1 border-l-1;
		@apply transform-rotate-45 transition-all-0.4s-ease-in-out;
		@apply absolute bottom-full block bg-white;
	}
	rk-item {
		@apply relative block min-h-10 w-full border-gray-300;
		@apply flex cursor-pointer flex-row items-center gap-2 text-lg text-gray-900;
		@apply transition-all-0.4s-ease-in-out;
	}
	rk-item:first-of-type {
		@apply rounded-t-md;
	}
	rk-item:last-of-type {
		@apply border-bottom-none rounded-b-md;
	}
	rk-item:hover {
		@apply bg-gray-200;
	}
	rk-item[aria-selected='true'] {
		@apply bg-red-300;
	}
</style>
