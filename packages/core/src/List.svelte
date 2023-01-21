<script>
	// import { navigable } from './actions'
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'

	const dispatch = createEventDispatcher()

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
	export let value = null

	function handleClick(item) {
		value = item
		dispatch('select', item)
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: filtered = items.filter((item) => !item.isDeleted)
</script>

<list class="flex flex-col w-full flex-shrink-0 select-none {className}">
	<slot />
	{#each filtered as item}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<item
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer w-full gap-2 select-none item"
			class:is-selected={value === item}
			on:click={() => handleClick(item)}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
			/>
		</item>
	{/each}
</list>
