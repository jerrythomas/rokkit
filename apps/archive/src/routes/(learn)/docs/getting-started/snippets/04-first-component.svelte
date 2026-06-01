<script>
	import { List } from '@rokkit/ui'

	let users = [
		{ id: 1, name: 'Alice Chen', role: 'Admin' },
		{ id: 2, name: 'Bob Smith', role: 'Developer' },
		{ id: 3, name: 'Carol Lee', role: 'Designer' }
	]

	// Tell Rokkit which fields to use
	const fields = { label: 'name', value: 'id' }
	let selected = $state(null)
</script>

<List items={users} {fields} bind:value={selected} />

{#if selected}
	<p>Selected user ID: {selected}</p>
{/if}
