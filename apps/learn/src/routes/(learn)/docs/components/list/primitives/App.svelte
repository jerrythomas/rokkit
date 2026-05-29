<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Profile']
	let value = $state(null)
</script>

<List {items} bind:value onselect={(v) => (value = v)} />

{#if value !== null}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
