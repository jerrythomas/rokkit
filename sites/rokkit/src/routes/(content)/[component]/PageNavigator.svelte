<script>
	import { createEventDispatcher } from 'svelte'
	import { Icon, defaultFields, defaultStateIcons } from '@rokkit/core'
	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }

	export let items = []
	export let value = null
	export let fields = {}
	export let numbers = false

	const navigate = defaultStateIcons.navigate
	let currentIndex = value ? items.findIndex((item) => item == value) : -1

	function handleClick(index) {
		if (index >= 0 && index < items.length) {
			value = items[index]
			currentIndex = index
			dispatch('select', value)
		}
	}

	$: fields = { ...defaultFields, ...fields }
	$: previous = currentIndex > 0 ? items[currentIndex - 1][fields.text] : null
	$: next =
		currentIndex < items.length - 1
			? items[currentIndex + 1][fields.text]
			: null
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<nav-pages class="grid grid-cols-3 select-none {className}" tabindex="0">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		class="flex items-center cursor-pointer"
		on:click={() => handleClick(currentIndex - 1)}
		tabIndex={currentIndex > 0 ? 0 : -1}
	>
		{#if currentIndex > 0}
			<Icon name={navigate.left} />
			{#if previous}
				<p>{previous}</p>
			{/if}
		{/if}
	</span>
	<span class="flex items-center justify-center">
		<block class="flex items-center">
			{#each items as item, index}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<pg
					class:numbers
					class:dot={!numbers}
					class:selected={value == item}
					on:click={() => handleClick(index)}
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
		class="flex items-center cursor-pointer"
		on:click={() => handleClick(currentIndex + 1)}
		tabIndex={currentIndex < items.length - 1 ? 0 : -1}
	>
		{#if currentIndex < items.length - 1}
			{#if next}
				<p class="w-full text-right">{next}</p>
			{/if}
			<Icon name={navigate.right} />
		{/if}
	</span>
</nav-pages>
