<script>
	import { List } from '@rokkit/ui'
	let items = $state([
		{ text: 'Fruits' },
		{ text: 'Vegetables' },
		{ text: 'Nuts' },
		{ text: 'Spices' }
	])
	let value = $state(null)
</script>

<List bind:items bind:value />
<p>Selected Value: <b>{value?.text}</b></p>
