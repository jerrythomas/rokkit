<script>
	import { List } from '@rokkit/ui'

	// Raw API response — no transformation
	const users = await fetch('/api/users').then((r) => r.json())
	// → [{ id: 1, name: 'Alice', role: 'Admin' }, ...]

	// Map your fields once — every component speaks the same language
	const fields = { label: 'name', value: 'id' }
</script>

<List items={users} {fields} bind:value />
