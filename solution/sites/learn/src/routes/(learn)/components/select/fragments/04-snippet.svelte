<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'

	const statuses = [
		{ text: 'Active', value: 'active', color: 'bg-success-z5' },
		{ text: 'Pending', value: 'pending', color: 'bg-warning-z5' },
		{ text: 'Inactive', value: 'inactive', color: 'bg-surface-z4' }
	]
	let value = $state(null)
</script>

<Select items={statuses} bind:value placeholder="Select a status">
	{#snippet itemContent(proxy)}
		<span class="inline-block size-2 rounded-full {proxy.get('color')}"></span>
		<span>{proxy.text}</span>
	{/snippet}
</Select>
