<script>
	import { MultiSelect } from '@rokkit/organisms'
	import { items } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<MultiSelect {items} {fields} bind:value />

<p>Selected Values</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
