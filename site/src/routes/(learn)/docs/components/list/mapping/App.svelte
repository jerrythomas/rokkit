<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ name: 'Dashboard', path: '/dashboard', icon: 'i-glyph:widget' },
		{ name: 'Analytics', path: '/analytics', icon: 'i-glyph:chart-2' },
		{ name: 'Reports', path: '/reports', icon: 'i-glyph:file-text' },
		{ type: 'separator' },
		{ name: 'Settings', path: '/settings', icon: 'i-glyph:settings' },
		{ name: 'Profile', path: '/profile', icon: 'i-glyph:user' }
	]

	const fields = { label: 'name', value: 'path' }
	let selected = $state(null)
</script>

<List {items} {fields} bind:value={selected} onselect={(v) => (selected = v)} />

{#if selected}
	<p class="text-surface-z6 mt-3 text-sm">Selected path: <strong>{selected}</strong></p>
{/if}
