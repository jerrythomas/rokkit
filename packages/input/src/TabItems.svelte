<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields } from '@rokkit/core'
	import TabItem from './TabItem.svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let allowClose = false
	export let value = items[0]

	function activate(item) {
		value = item
		dispatch('switch', item)
	}
	function closeTab(index) {
		items[index].isClosed = true
	}
	$: fields = { ...defaultFields, ...fields }
	$: filtered = items.filter((item) => !item.isClosed)
</script>

{#each filtered as item, index}
	{@const label = item[fields.text]}
	<TabItem
		icon={item[fields.icon]}
		{label}
		{allowClose}
		active={value == item}
		on:click={() => activate(item)}
		on:close={() => closeTab(index)}
	/>
{/each}
