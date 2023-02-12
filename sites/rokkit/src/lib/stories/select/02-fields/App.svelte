<script>
	import { Select } from '@rokkit/input'
	import { items } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<Select {items} {fields} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
