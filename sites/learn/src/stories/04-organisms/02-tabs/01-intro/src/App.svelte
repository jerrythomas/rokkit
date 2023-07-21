<script>
	import { Tabs } from '@rokkit/organisms'

	let options = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value
</script>

<Tabs {options} bind:value />
<pre>
	{JSON.stringify(value)}
</pre>
