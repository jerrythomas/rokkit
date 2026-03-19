<script>
	import { Dropdown } from '@rokkit/ui'

	const statuses = [
		{ name: 'Active', id: 'active' },
		{ name: 'Paused', id: 'paused' },
		{ name: 'Archived', id: 'archived' }
	]

	const fields = { text: 'name', value: 'id' }

	let value = $state(null)
</script>

<Dropdown items={statuses} {fields} bind:value placeholder="Set status" />
