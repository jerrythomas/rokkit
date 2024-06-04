<script>
	import { Tabs } from '@rokkit/ui'
	import { options } from './data.js'
	import Custom from './Custom.svelte'

	let using = { default: Custom }
	let fields = { text: 'name', image: 'photo', url: 'artist' }
	let value
</script>

<Tabs {options} {using} {fields} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
