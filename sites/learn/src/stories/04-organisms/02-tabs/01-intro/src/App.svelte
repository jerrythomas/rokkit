<script>
	import { Tabs } from '@rokkit/organisms'

	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value
</script>

<Tabs {items} bind:value />
<pre>
	{JSON.stringify(value)}
</pre>
