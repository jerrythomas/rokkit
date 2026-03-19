<script>
	// @ts-nocheck
	import { Dropdown } from '@rokkit/ui'

	// Data uses 'name' and 'id' instead of 'text' and 'value'
	const statuses = [
		{ name: 'Active', id: 'active' },
		{ name: 'Paused', id: 'paused' },
		{ name: 'Draft', id: 'draft' },
		{ name: 'Archived', id: 'archived' }
	]

	const fields = { text: 'name', value: 'id' }

	let value = $state(null)
</script>

<Dropdown items={statuses} {fields} bind:value placeholder="Set status" />

<p class="text-surface-z5 mt-3 text-sm">Selected: <strong>{value ?? 'none'}</strong></p>
