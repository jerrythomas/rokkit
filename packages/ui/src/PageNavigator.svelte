<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }

	export let items = []
	export let value = items[0]
	export let fields = {}
	export let numbers = false

	const navigate = defaultStateIcons.navigate

	let previous
	let next

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

	$: fields = { ...defaultFields, ...fields }
	$: updateOnChange(value, items)

	// $: value = items.findIndex((x) => x === value) ? value : items[0]
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<nav-pages class="grid grid-cols-3 select-none {className}" tabindex="0">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		class="flex cursor-pointer items-center"
		on:click={() => handleClick(previous)}
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
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<pg
					class:numbers
					class:dot={!numbers}
					class:is-selected={value === item}
					on:click={() => handleClick(item)}
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
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		class="flex cursor-pointer items-center justify-end"
		on:click={() => handleClick(next)}
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
