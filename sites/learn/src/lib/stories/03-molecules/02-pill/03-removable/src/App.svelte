<script>
	import { Pill } from '@rokkit/ui'

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
		<Pill value={item.text} removable={true} onremove={() => handleRemove(index)} />
	{/each}
</span>
