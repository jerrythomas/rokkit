<script>
	import { DropDown } from '@rokkit/organisms'
	import { options } from './data.js'

	let fields = { text: 'name', image: 'photo' }
	let value
</script>

<DropDown {options} {fields} bind:value title="Dropdown" />

<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
