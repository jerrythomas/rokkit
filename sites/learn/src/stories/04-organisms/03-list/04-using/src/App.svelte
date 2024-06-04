<script>
	import { List } from '@rokkit/ui'
	import { items } from './data.js'
	import EmailItem from './EmailItem.svelte'

	let using = { default: EmailItem }
	let value
</script>

<List {items} {using} bind:value />
<p>Selected Value</p>
<pre>{JSON.stringify(value, null, 2)}</pre>
