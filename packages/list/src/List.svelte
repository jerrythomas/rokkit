<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from './constants'
	import ListItem from './ListItem.svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let component = null
	// export let key = 'id'
	export let selected = null
	export let fields

	$: fields = { ...defaultFields, ...fields }

	function handleClick(item) {
		selected = item[fields.id]
		dispatch('select', item)
	}
</script>

<ul class="flex flex-col w-full list">
	{#each items as item}
		<li
			class="flex flex-shrink-0 flex-grow-0 min-h-12 items-center cursor-pointer leading-loose w-full gap-2 item"
			class:selected={item[fields.id] === selected}
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
