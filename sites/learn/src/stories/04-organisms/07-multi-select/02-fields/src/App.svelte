<script>
	import { MultiSelect } from '@rokkit/ui'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<MultiSelect {options} {fields} bind:value />

<p>Selected Values</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
