<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	const dispatch = createEventDispatcher()

	

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {any} [value]
	 * @property {any} [fields]
	 * @property {boolean} [numbers]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		items = [],
		value = $bindable(items[0]),
		fields = $bindable({}),
		numbers = false
	} = $props();

	const navigate = defaultStateIcons.navigate

	let previous = $state()
	let next = $state()

	function updateOnChange(value, items) {
		let index = items.findIndex((x) => x === value)
		if (index === -1) value = items[0]
		// } else {
		previous = index > 0 ? items[index - 1] : null
		next = index < items.length - 1 ? items[index + 1] : null
		// }
	}

	function handleClick(item) {
		if (item) {
			value = item
			dispatch('select', value)
		}
	}

	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	run(() => {
		updateOnChange(value, items)
	});

	// $: value = items.findIndex((x) => x === value) ? value : items[0]
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<nav-pages class="grid grid-cols-3 select-none {className}" tabindex="0">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<span
		class="flex cursor-pointer items-center"
		onclick={() => handleClick(previous)}
		tabIndex={previous ? 0 : -1}
	>
		{#if previous}
			<Icon name={navigate.left} />
			<p>
				{#if previous[fields.text]}
					{previous[fields.text]}
				{/if}
			</p>
		{/if}
	</span>
	<span class="flex items-center justify-center">
		<block class="flex items-center">
			{#each items as item, index}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<pg
					class:numbers
					class:dot={!numbers}
					class:is-selected={value === item}
					onclick={() => handleClick(item)}
					tabindex="0"
					class="cursor-pointer"
				>
					{#if numbers}
						{index + 1}
					{/if}
				</pg>
			{/each}
		</block>
	</span>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<span
		class="flex cursor-pointer items-center justify-end"
		onclick={() => handleClick(next)}
		tabIndex={next ? 0 : -1}
	>
		{#if next}
			<p class="text-right">
				{#if next[fields.text]}
					{next[fields.text]}
				{/if}
			</p>
			<Icon name={navigate.right} />
		{/if}
	</span>
</nav-pages>
