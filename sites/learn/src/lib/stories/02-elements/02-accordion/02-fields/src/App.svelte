<script>
	import { Accordion, Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import { items } from './data.js'

	const fields = {
		text: 'name',
		children: 'values',
		image: 'photo'
	}
	let value = $state(null)
	let mapping = new FieldMapper(fields, { default: Item })
</script>

<Accordion {items} {mapping} autoCloseSiblings bind:value />

<p>Selected item</p>
<pre>JSON.stringify(value, null, 2)</pre>
