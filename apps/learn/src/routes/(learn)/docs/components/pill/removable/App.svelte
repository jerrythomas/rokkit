<script>
	// @ts-nocheck
	import { Pill } from '@rokkit/ui'

	let items = $state([
		{ label: 'Sample Removable 1' },
		{ label: 'Sample Removable 2' },
		{ label: 'Sample Removable 3' }
	])

	function handleRemove(index) {
		items.splice(index, 1)
		items = [...items]
	}
</script>

<span class="flex flex-wrap gap-2">
	{#each items as item, index (index)}
		<Pill value={item.text} removable={true} onremove={() => handleRemove(index)} />
	{/each}
</span>
