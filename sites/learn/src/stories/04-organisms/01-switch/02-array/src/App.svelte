<script>
	import { Switch } from '@rokkit/organisms'

	let items = ['one', 'two', 'three']
	let value
</script>

<Switch {items} compact={false} bind:value />
<p>Selected Value: <b>{value}</b></p>
