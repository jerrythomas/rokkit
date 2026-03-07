<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	// Imagine this came straight from your API — no transformation needed
	let users = $state([
		{ id: 1, name: 'Alice Chen', role: 'Admin' },
		{ id: 2, name: 'Bob Smith', role: 'Developer' },
		{ id: 3, name: 'Carol Lee', role: 'Designer' },
		{ id: 4, name: 'Dan Brown', role: 'Manager' }
	])

	let selectedId = $state(null)
	let selected = $derived(users.find((u) => u.id === selectedId))

	// Tell Rokkit which fields to use — that's it
	const fields = { label: 'name', value: 'id' }
</script>

<div class="space-y-4">
	<List items={users} {fields} bind:value={selectedId} />
	{#if selected}
		<p class="text-sm">
			Selected: <strong>{selected.name}</strong> — {selected.role}
		</p>
	{:else}
		<p class="text-surface-z5 text-sm">Click a user to select</p>
	{/if}
</div>
