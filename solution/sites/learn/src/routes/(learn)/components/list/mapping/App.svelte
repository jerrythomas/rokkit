<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ name: 'Dashboard', path: '/dashboard', icon: 'i-lucide:layout-dashboard' },
		{ name: 'Analytics', path: '/analytics', icon: 'i-lucide:bar-chart-2' },
		{ name: 'Reports', path: '/reports', icon: 'i-lucide:file-text' },
		{ type: 'separator' },
		{ name: 'Settings', path: '/settings', icon: 'i-lucide:settings' },
		{ name: 'Profile', path: '/profile', icon: 'i-lucide:user' }
	]

	const fields = { text: 'name', value: 'path' }
	let selected = $state(null)
</script>

<List {items} {fields} bind:value={selected} onselect={(v) => (selected = v)} />

{#if selected}
	<p class="text-surface-z6 mt-3 text-sm">Selected path: <strong>{selected}</strong></p>
{/if}
