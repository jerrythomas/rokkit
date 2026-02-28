<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const statuses = [
		{ label: 'Active', value: 'active', color: 'bg-success-z5' },
		{ label: 'Pending', value: 'pending', color: 'bg-warning-z5' },
		{ label: 'Inactive', value: 'inactive', color: 'bg-surface-z4' }
	]
	let value = $state(null)
</script>

<Select options={statuses} bind:value placeholder="Select a status">
	{#snippet option(proxy)}
		<span class="inline-block size-2 rounded-full {proxy.get('color')}"></span>
		<span>{proxy.text}</span>
	{/snippet}
</Select>
