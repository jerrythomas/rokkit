<script>
	import { Accordion } from '@rokkit/ui'
	
	const data = [
		{
			text: 'Fruits',
			children: ['Apple', 'Orange', 'Banana', 'Avocado']
		},
		{
			text: 'Vegetables',
			children: ['Carrot', 'Tomato', 'Lettuce']
		},
		{
			text: 'Nuts',
			children: ['Almonds', 'Walnuts', 'Pistachios']
		},
		{
			text: 'Spices',
			children: ['Cinnamon', 'Cloves', 'Turmeric']
		}
	]

	let value = $state(null)
</script>

<Accordion items={data} bind:value />

<div class="mt-4">
	<p><strong>Selected Value:</strong></p>
	<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
</div>