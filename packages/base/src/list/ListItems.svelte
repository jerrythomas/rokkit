<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '../constants'
	import { Text } from '../items'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let using = {}
	export let activeItem = null

	function handleClick(item) {
		activeItem = item
		dispatch('click', item)
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
	$: style = $$props.class || 'list'

	$: filtered = items.filter((item) => !item.isDeleted)
</script>

<ul class="flex flex-col w-full flex-shrink-0 select-none {style}">
	{#each filtered as item}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		<li
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer leading-loose w-full gap-2 select-none item"
			class:active={activeItem === item}
			on:click={() => handleClick(item)}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
			/>
		</li>
	{/each}
</ul>
