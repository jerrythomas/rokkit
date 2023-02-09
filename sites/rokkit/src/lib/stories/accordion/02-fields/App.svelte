<script>
	import { Accordion } from '@rokkit/core'
	import { items } from './data.js'

	const fields = {
		text: 'category',
		data: 'values',
		fields: {
			text: 'name',
			image: 'photo'
		}
	}
	let value
</script>

<Accordion {items} {fields} autoClose bind:value />

<p>Selected item</p>
<pre>JSON.stringify(value, null, 2)</pre>
