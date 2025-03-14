<script>
	import { Select } from '@rokkit/ui'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value = $state()
</script>

<Select {options} {fields} bind:value />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
