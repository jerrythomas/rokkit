<script>
	import { Range } from '@rokkit/ui'

	let value = $state(60)
</script>

<Range bind:value tickStep={5} step={5} labelSkip={1} />
<p>Selected Value: <b>{value}</b></p>