<script>
	import { Switch } from '@rokkit/ui'

	let options = ['one', 'two', 'three']
	let value = $state()
</script>

<Switch {options} bind:value />
<p>Selected Value: <b>{value}</b></p>
