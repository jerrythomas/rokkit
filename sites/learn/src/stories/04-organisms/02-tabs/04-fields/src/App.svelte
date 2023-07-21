<script>
	import { Tabs } from '@rokkit/organisms'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<Tabs {options} {fields} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
