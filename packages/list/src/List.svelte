<script>
	import { createEventDispatcher } from 'svelte'
	import ListItem from './ListItem.svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let component = null
	export let key = 'id'
	export let selected = null

	function handleClick(item) {
		selected = item[key]
		dispatch('select', item)
	}
</script>

<ul class="flex flex-col list">
	{#each items as item}
		<li
			class="flex flex-shrink-0 flex-grow-0 px-4 min-h-12 items-center cursor-pointer leading-loose w-full gap-2 item"
			class:selected={item[key] === selected}
			on:click={() => handleClick(item)}
		>
			<ListItem
				{component}
				bind:item
				on:change
				on:click={() => handleClick(item)}
			/>
		</li>
	{/each}
</ul>
