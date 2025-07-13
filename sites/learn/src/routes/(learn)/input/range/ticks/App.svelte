<script>
	import { Range } from '@rokkit/ui'

	let value = $state(25)
</script>

<Range bind:value step={5} tickStep={10} />
<p>Selected Value: <b>{value}</b></p>