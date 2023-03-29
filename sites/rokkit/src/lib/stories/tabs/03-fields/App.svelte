<script>
	import { Tabs } from '@rokkit/core'
	import { items } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<Tabs {items} {fields} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
