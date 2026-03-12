<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ label: 'Dashboard', icon: 'i-lucide:layout-dashboard' },
		{ label: 'Analytics', icon: 'i-lucide:bar-chart-2' },
		{ label: 'Reports', icon: 'i-lucide:file-text' },
		{ type: 'separator' },
		{ label: 'Settings', icon: 'i-lucide:settings' },
		{ label: 'Profile', icon: 'i-lucide:user', disabled: true }
	]

	let value = $state(null)
</script>

<List {items} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
