<script>
	import { List } from '@rokkit/ui'

	let selected = $state(null)
	const users = [
		{ name: 'Alice', id: 1 },
		{ name: 'Bob', id: 2 }
	]
	const fields = { label: 'name', value: 'id' }
</script>

<List items={users} {fields} bind:value={selected} />
<p>Selected ID: {selected}</p>
