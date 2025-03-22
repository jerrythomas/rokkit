<script>
	import { Accordion } from '@rokkit/ui'
	import { items } from './data.js'

	const fields = {
		text: 'name',
		children: 'values',
		image: 'photo'
	}
	let value = $state(null)
</script>

<Accordion {items} {fields} autoCloseSiblings bind:value />

<p>Selected item</p>
<pre>JSON.stringify(value, null, 2)</pre>
