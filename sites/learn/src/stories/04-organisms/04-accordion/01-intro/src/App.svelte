<script>
	import { Accordion } from '@rokkit/ui'
	import { items } from './data'

	let value
</script>

<Accordion {items} bind:value />

<p>Selected Value :</p>
<pre> JSON.stringify(value, null, 2)}</pre>
