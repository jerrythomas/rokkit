<script>
	import { List, Link } from '@rokkit/core'
	import { items } from './data.js'

	let using = { default: Link }
	let fields = { text: 'name', image: 'photo', url: 'artist' }
	let value
</script>

<List {items} {using} {fields} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
