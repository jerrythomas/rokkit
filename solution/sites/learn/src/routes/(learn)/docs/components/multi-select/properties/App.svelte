<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'

	const items = [
		{ label: 'Red', value: 'red' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Purple', value: 'purple' }
	]
	let value = $state([])
</script>

<div class="w-[300px]">
	<MultiSelect {items} bind:value placeholder="Select colors" />
</div>

<p class="mt-3 text-sm text-surface-z5">Selected: <strong>{value.join(', ') || 'none'}</strong></p>
