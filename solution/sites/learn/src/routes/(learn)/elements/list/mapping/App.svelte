<script>
	import { List } from '@rokkit/ui'
	import { data } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value = $state(null)
	let items = $state(data)
</script>

<List bind:items {fields} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
