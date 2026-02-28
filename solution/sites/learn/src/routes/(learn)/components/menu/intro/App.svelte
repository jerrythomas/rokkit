<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let selected = $state(null)

	let items = [
		{ text: 'Copy', icon: 'i-lucide:copy' },
		{ text: 'Cut', icon: 'i-lucide:scissors' },
		{ text: 'Paste', icon: 'i-lucide:clipboard' },
		{ text: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<div class="flex items-start gap-8">
	<Menu {items} label="Actions" onselect={(value) => (selected = value)} />

	{#if selected}
		<p class="text-surface-z7">
			Selected: <strong>{JSON.stringify(selected)}</strong>
		</p>
	{/if}
</div>
