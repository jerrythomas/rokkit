<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ label: 'Dashboard', icon: 'i-glyph:widget' },
		{ label: 'Analytics', icon: 'i-glyph:chart-2' },
		{ label: 'Reports', icon: 'i-glyph:file-text' },
		{ type: 'separator' },
		{ label: 'Settings', icon: 'i-glyph:settings' },
		{ label: 'Profile', icon: 'i-glyph:user', disabled: true }
	]

	let value = $state(null)
</script>

<List {items} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
