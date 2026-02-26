<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let selected = $state(null)

	let options = [
		{ text: 'Copy', icon: 'i-lucide:copy' },
		{ text: 'Cut', icon: 'i-lucide:scissors' },
		{ text: 'Paste', icon: 'i-lucide:clipboard' },
		{ text: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<div class="flex items-start gap-8">
	<Menu {options} label="Actions" onselect={(item) => (selected = item)} />

	{#if selected}
		<p class="text-surface-z7">
			Selected: <strong>{selected.text}</strong>
		</p>
	{/if}
</div>
