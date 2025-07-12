<script>
	import { TabGroup } from '@rokkit/bits-ui'

	let options = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value = $state()
</script>

<TabGroup {options} bind:value />
<pre>
	{JSON.stringify(value)}
</pre>
