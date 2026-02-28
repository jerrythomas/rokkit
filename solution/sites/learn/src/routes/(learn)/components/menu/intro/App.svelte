<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let selected = $state(null)

	let options = [
		{ label: 'Copy', icon: 'i-lucide:copy' },
		{ label: 'Cut', icon: 'i-lucide:scissors' },
		{ label: 'Paste', icon: 'i-lucide:clipboard' },
		{ label: 'Delete', icon: 'i-lucide:trash' }
	]
</script>

<div class="flex items-start gap-8">
	<Menu {options} label="Actions" onselect={(value) => (selected = value)} />

	{#if selected}
		<p class="text-surface-z7">
			Selected: <strong>{JSON.stringify(selected)}</strong>
		</p>
	{/if}
</div>
