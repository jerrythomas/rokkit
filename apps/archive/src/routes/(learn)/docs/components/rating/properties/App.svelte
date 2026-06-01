<script>
	import { Rating } from '@rokkit/ui'

	let value = $state(3)
</script>

<Rating bind:value max={5} />
<p>Selected Value: <b>{value}</b></p>
