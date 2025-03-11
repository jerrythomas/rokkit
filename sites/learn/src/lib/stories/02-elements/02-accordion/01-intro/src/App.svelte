<script>
	import { Accordion } from '@rokkit/ui'
	import { data } from './data'

	let value = $state(null)
	let items = $state(data)
</script>

<Accordion {items} bind:value />

<p>Selected Value :</p>
<pre> JSON.stringify(value, null, 2)}</pre>
