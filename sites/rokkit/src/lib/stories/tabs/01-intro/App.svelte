<script>
	import { Tabs } from '@rokkit/core'

	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value
</script>

<Tabs {items} bind:value />
<pre>
	{JSON.stringify(value)}
</pre>
