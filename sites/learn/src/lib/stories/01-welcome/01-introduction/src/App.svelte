<script>
	import { List } from '@rokkit/ui'
	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state(null)
</script>

<List {items} bind:value />
<p>Selected Value: <b>{value}</b></p>
