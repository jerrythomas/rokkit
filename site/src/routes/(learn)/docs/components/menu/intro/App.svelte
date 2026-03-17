<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let selected = $state(null)

	let items = [
		{ label: 'Copy', icon: 'i-glyph:copy' },
		{ label: 'Cut', icon: 'i-glyph:scissors' },
		{ label: 'Paste', icon: 'i-glyph:clipboard' },
		{ label: 'Delete', icon: 'i-glyph:trash-bin' }
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
