<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const statuses = [
		{ label: 'Active', value: 'active', color: 'bg-success-z5' },
		{ label: 'Pending', value: 'pending', color: 'bg-warning-z5' },
		{ label: 'Inactive', value: 'inactive', color: 'bg-surface-z4' },
		{ label: 'Blocked', value: 'blocked', color: 'bg-error-z5', disabled: true }
	]

	let value = $state(null)
</script>

<Select items={statuses} bind:value placeholder="Select a status">
	{#snippet itemContent(proxy)}
		<span class="inline-block size-2 rounded-full {proxy.get('color')}"></span>
		<span>{proxy.label}</span>
	{/snippet}
</Select>

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
