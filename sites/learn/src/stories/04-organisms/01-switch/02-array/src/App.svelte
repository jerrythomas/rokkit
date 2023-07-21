<script>
	import { Switch } from '@rokkit/organisms'

	let options = ['one', 'two', 'three']
	let value
</script>

<Switch {options} bind:value />
<p>Selected Value: <b>{value}</b></p>
