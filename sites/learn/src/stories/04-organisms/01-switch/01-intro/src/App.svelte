<script>
	import { Switch } from '@rokkit/ui'

	let value = $state(false)
</script>

<Switch bind:value />
<p>Selected Value: <b>{value}</b></p>
