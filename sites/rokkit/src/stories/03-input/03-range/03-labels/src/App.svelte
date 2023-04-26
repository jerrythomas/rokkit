<script>
	import { Range } from '@rokkit/input'

	let value
</script>

<Range bind:value tickStep={10} step={5} labelSkip={1} />
<p>Selected Value: <b>{value}</b></p>
