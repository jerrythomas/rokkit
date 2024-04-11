<script>
	import { Stepper } from '@rokkit/layout'
	import { data } from './data'

	let value
</script>

<Stepper {data} bind:value />

Current Stage
<pre>
	{JSON.stringify(value, null, 2)}
</pre>
