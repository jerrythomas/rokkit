<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import { Text } from './items'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let using = {}
	export let selected = null

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }

	function handleClick(item) {
		selected = item[fields.id]
		dispatch('select', item)
	}
</script>

<ul class="flex flex-col w-full list">
	{#each items as item}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		<li
			class="flex flex-shrink-0 flex-grow-0 min-h-8 items-center cursor-pointer leading-loose w-full gap-2 item"
			class:selected={item[fields.id] === selected}
			on:click={() => handleClick(item)}
		>
			<svelte:component
				this={component}
				bind:content={item}
				{fields}
				on:change
				on:click={() => handleClick(item)}
			/>
		</li>
	{/each}
</ul>
