<script>
	import { createEventDispatcher } from 'svelte'
	import TabItem from './TabItem.svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let closeable = false
	export let activeItem = items[0]

	function activate(item) {
		activeItem = item
		dispatch('switch', item)
	}
	function closeTab(index) {
		items[index].isClosed = true
	}

	$: console.log('tabItems', items)
	$: filtered = items //items.filter((item) => !item.isClosed)
</script>

{#each filtered as item, index}
	{@const label = item[fields.text] || index + 1}
	<TabItem
		icon={item[fields.icon]}
		{label}
		{closeable}
		active={activeItem == item}
		on:click={() => activate(item)}
		on:close={() => closeTab(index)}
	/>
{/each}
