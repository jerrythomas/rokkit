<script>
	import { Tabs } from '@rokkit/ui'

	let options = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state()
</script>

<Tabs {options} bind:value />
<pre>
	{JSON.stringify(value)}
</pre>
