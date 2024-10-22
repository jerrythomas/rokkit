<script>
	import { ItemWrapper } from '@rokkit/ui'

	let items = $state([
		{ text: 'Sample Removable 1' },
		{ text: 'Sample Removable 2' },
		{ text: 'Sample Removable 3' }
	])

	function handleRemove(index) {
		items.splice(index, 1)
		items = [...items]
	}
</script>

<span class="flex flex-wrap gap-2">
	{#each items as item, index}
		<ItemWrapper value={item.text} removable={true} on:remove={() => handleRemove(index)} />
	{/each}
</span>
