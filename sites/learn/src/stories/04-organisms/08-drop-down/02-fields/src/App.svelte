<script>
	import { DropDown } from '@rokkit/ui'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<DropDown {options} {fields} bind:value title="Dropdown" />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
