<script>
	import { List, Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import { data } from './data.js'

	let mapping = new FieldMapper({ text: 'name', image: 'photo' }, { default: Item })
	let value = $state(null)
	let items = $state(data)
</script>

<List bind:items {mapping} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
