<script>
	import { Range } from '@rokkit/ui'

	let value
</script>

<Range bind:value ticks={10} step={5} labelSkip={1} />
<p>Selected Value: <b>{value}</b></p>
