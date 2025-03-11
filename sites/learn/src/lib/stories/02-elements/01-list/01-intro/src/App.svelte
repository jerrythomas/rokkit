<script>
	import { List } from '@rokkit/ui'

	let items = $state(['Fruits', 'Vegetables', 'Nuts', 'Spices'])
	let value = $state(null)
</script>

<List bind:items bind:value />
<p>Selected Value: <b>{value}</b></p>
