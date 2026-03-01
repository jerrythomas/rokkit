<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const statuses = [
		{ text: 'Active', value: 'active', color: 'bg-success-z5' },
		{ text: 'Pending', value: 'pending', color: 'bg-warning-z5' },
		{ text: 'Inactive', value: 'inactive', color: 'bg-surface-z4' },
		{ text: 'Blocked', value: 'blocked', color: 'bg-error-z5', disabled: true }
	]

	let value = $state(null)
</script>

<Select items={statuses} bind:value placeholder="Select a status">
	{#snippet itemContent(proxy)}
		<span class="inline-block size-2 rounded-full {proxy.get('color')}"></span>
		<span>{proxy.label}</span>
	{/snippet}
</Select>

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value ?? 'none'}</strong></p>
