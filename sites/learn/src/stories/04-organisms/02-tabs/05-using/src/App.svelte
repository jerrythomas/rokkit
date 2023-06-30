<script>
	import { Tabs } from '@rokkit/organisms'
	import { items } from './data.js'
	import Custom from './Custom.svelte'

	let using = { default: Custom }
	let fields = { text: 'name', image: 'photo', url: 'artist' }
	let value
</script>

<Tabs {items} {using} {fields} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
