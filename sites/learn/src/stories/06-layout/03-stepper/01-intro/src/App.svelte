<script>
	import { Stepper } from '@rokkit/ui'
	import { data } from './data'

	let value = $state()
</script>

<Stepper {data} bind:value />

Current Stage
<pre>
	{JSON.stringify(value, null, 2)}
</pre>
